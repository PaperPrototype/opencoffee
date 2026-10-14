-- Events & ticketing: anyone can host coffee events (Eventbrite-style), paid tickets go through
-- Stripe Connect (destination charges; the platform keeps an application fee).
--
-- Money is always an integer in the currency's minor unit (cents; yen for zero-decimal currencies).
--
-- Clients only ever READ these tables (under RLS) plus edit their own host/event/ticket-type rows.
-- Anything that touches inventory or money (orders, tickets, Stripe ids) is written by the app server
-- with the secret key, through the security-definer functions at the bottom.

-- Hosts --------------------------------------------------------------------------------------------

create table public.hosts (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null unique references auth.users (id) on delete cascade,
	slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$'),
	name text not null check (char_length(name) between 1 and 80),
	bio text check (char_length(bio) <= 2000),
	website text check (char_length(website) <= 300 and website ~ '^https?://'),
	-- Stripe Connect account that receives ticket money. Server-managed.
	stripe_account_id text unique,
	-- Ticket money reaches the host as a transfer (destination charges), so the account's
	-- `transfers` capability being active is what lets the host sell paid tickets.
	stripe_transfers_enabled boolean not null default false,
	stripe_payouts_enabled boolean not null default false,
	stripe_details_submitted boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

comment on table public.hosts is 'Organizer profile for a member who hosts events. One per user.';

alter table public.hosts enable row level security;

create policy "Hosts are public"
	on public.hosts for select
	to anon, authenticated
	using (true);

create policy "Members can create their own host profile"
	on public.hosts for insert
	to authenticated
	with check ((select auth.uid()) = user_id);

create policy "Hosts can update their own profile"
	on public.hosts for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

-- Stripe columns are only written by the server.
revoke insert, update, delete on public.hosts from anon, authenticated;
grant insert (user_id, slug, name, bio, website) on public.hosts to authenticated;
grant update (slug, name, bio, website) on public.hosts to authenticated;

-- The Stripe account id is nobody else's business; expose only whether the host can take payments.
revoke select on public.hosts from anon, authenticated;
grant select (
	id, user_id, slug, name, bio, website,
	stripe_transfers_enabled, stripe_payouts_enabled, stripe_details_submitted,
	created_at, updated_at
) on public.hosts to anon, authenticated;

create trigger hosts_set_updated_at
	before update on public.hosts
	for each row execute function public.set_updated_at();

-- Events -------------------------------------------------------------------------------------------

create type public.event_status as enum ('draft', 'published', 'cancelled');

create type public.event_category as enum (
	'cupping', 'throwdown', 'festival', 'workshop', 'competition', 'meetup', 'class', 'other'
);

create table public.events (
	id uuid primary key default gen_random_uuid(),
	host_id uuid not null references public.hosts (id) on delete cascade,
	slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$'),
	status public.event_status not null default 'draft',
	title text not null check (char_length(title) between 3 and 140),
	summary text check (char_length(summary) <= 280),
	description text check (char_length(description) <= 20000),
	category public.event_category not null default 'other',
	cover_image_url text check (cover_image_url ~ '^https?://'),
	starts_at timestamptz not null,
	ends_at timestamptz not null,
	-- IANA zone the event happens in; times are shown in it.
	timezone text not null default 'UTC',
	is_online boolean not null default false,
	venue_name text check (char_length(venue_name) <= 140),
	address text check (char_length(address) <= 300),
	city text check (char_length(city) <= 100),
	country text check (char_length(country) <= 100),
	-- ISO 4217, lowercase like Stripe. One currency per event.
	currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
	-- Optional cap across all ticket types (e.g. room size).
	capacity integer check (capacity > 0),
	refund_policy text check (char_length(refund_policy) <= 1000),
	published_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	check (ends_at >= starts_at)
);

comment on table public.events is 'A coffee event listed by a host.';

create index events_listing_idx on public.events (status, starts_at);
create index events_host_idx on public.events (host_id);

alter table public.events enable row level security;

create function public.is_event_host(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select exists (
		select 1 from public.events e
		join public.hosts h on h.id = e.host_id
		where e.id = p_event_id and h.user_id = (select auth.uid())
	);
$$;

create function public.is_host(p_host_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select exists (select 1 from public.hosts where id = p_host_id and user_id = (select auth.uid()));
$$;

create policy "Published and cancelled events are public"
	on public.events for select
	to anon, authenticated
	using (status <> 'draft' or public.is_host(host_id));

create policy "Hosts can create events"
	on public.events for insert
	to authenticated
	with check (public.is_host(host_id) and status = 'draft');

create policy "Hosts can edit their events"
	on public.events for update
	to authenticated
	using (public.is_host(host_id))
	with check (public.is_host(host_id));

create policy "Hosts can delete draft events"
	on public.events for delete
	to authenticated
	using (public.is_host(host_id) and status = 'draft');

-- Status changes (publish/cancel) go through the server so it can check Stripe and refund.
revoke insert, update on public.events from anon, authenticated;
grant insert (
	host_id, slug, title, summary, description, category, cover_image_url, starts_at, ends_at, timezone,
	is_online, venue_name, address, city, country, currency, capacity, refund_policy
) on public.events to authenticated;
grant update (
	slug, title, summary, description, category, cover_image_url, starts_at, ends_at, timezone,
	is_online, venue_name, address, city, country, currency, capacity, refund_policy
) on public.events to authenticated;

create trigger events_set_updated_at
	before update on public.events
	for each row execute function public.set_updated_at();

-- Ticket types -------------------------------------------------------------------------------------

create table public.ticket_types (
	id uuid primary key default gen_random_uuid(),
	event_id uuid not null references public.events (id) on delete cascade,
	name text not null check (char_length(name) between 1 and 80),
	description text check (char_length(description) <= 500),
	-- 0 = free. Minor units of events.currency.
	price integer not null default 0 check (price >= 0),
	-- null = unlimited (still bounded by events.capacity).
	quantity integer check (quantity >= 0),
	max_per_order integer not null default 10 check (max_per_order between 1 and 50),
	sales_start timestamptz,
	sales_end timestamptz,
	sort_order integer not null default 0,
	is_hidden boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index ticket_types_event_idx on public.ticket_types (event_id, sort_order);

alter table public.ticket_types enable row level security;

create policy "Ticket types of visible events are public"
	on public.ticket_types for select
	to anon, authenticated
	using (
		exists (select 1 from public.events e where e.id = event_id)
		and (not is_hidden or public.is_event_host(event_id))
	);

create policy "Hosts manage ticket types"
	on public.ticket_types for all
	to authenticated
	using (public.is_event_host(event_id))
	with check (public.is_event_host(event_id));

create trigger ticket_types_set_updated_at
	before update on public.ticket_types
	for each row execute function public.set_updated_at();

-- Orders -------------------------------------------------------------------------------------------

create type public.order_status as enum ('pending', 'completed', 'expired', 'cancelled', 'refunded');

create table public.orders (
	id uuid primary key default gen_random_uuid(),
	event_id uuid not null references public.events (id) on delete restrict,
	user_id uuid not null references auth.users (id) on delete restrict,
	status public.order_status not null default 'pending',
	buyer_name text,
	buyer_email text,
	currency text not null,
	-- What the buyer pays (prices are all-in; no checkout fees are added on top).
	total integer not null check (total >= 0),
	-- Platform's cut (Stripe application fee), deducted from the host's payout.
	platform_fee integer not null default 0 check (platform_fee >= 0),
	-- Pending orders hold inventory until this time.
	expires_at timestamptz,
	stripe_checkout_session_id text unique,
	stripe_payment_intent_id text unique,
	completed_at timestamptz,
	refunded_at timestamptz,
	-- Set when the confirmation email went out, so the webhook and return page don't both send it.
	confirmation_sent_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index orders_event_idx on public.orders (event_id, status);
create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders (id) on delete cascade,
	ticket_type_id uuid not null references public.ticket_types (id) on delete restrict,
	quantity integer not null check (quantity > 0),
	unit_price integer not null check (unit_price >= 0)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_type_idx on public.order_items (ticket_type_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Buyers and hosts can view orders"
	on public.orders for select
	to authenticated
	using ((select auth.uid()) = user_id or public.is_event_host(event_id));

create policy "Buyers and hosts can view order items"
	on public.order_items for select
	to authenticated
	using (
		exists (
			select 1 from public.orders o
			where o.id = order_id and ((select auth.uid()) = o.user_id or public.is_event_host(o.event_id))
		)
	);

revoke insert, update, delete on public.orders, public.order_items from anon, authenticated;

create trigger orders_set_updated_at
	before update on public.orders
	for each row execute function public.set_updated_at();

-- Tickets ------------------------------------------------------------------------------------------

create type public.ticket_status as enum ('valid', 'void');

create table public.tickets (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders (id) on delete cascade,
	event_id uuid not null references public.events (id) on delete restrict,
	ticket_type_id uuid not null references public.ticket_types (id) on delete restrict,
	user_id uuid not null references auth.users (id) on delete restrict,
	attendee_name text,
	-- Printed on the ticket / encoded in its QR; what door staff check in.
	code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
	status public.ticket_status not null default 'valid',
	checked_in_at timestamptz,
	created_at timestamptz not null default now()
);

create index tickets_event_idx on public.tickets (event_id);
create index tickets_user_idx on public.tickets (user_id);
create index tickets_order_idx on public.tickets (order_id);

alter table public.tickets enable row level security;

create policy "Holders and hosts can view tickets"
	on public.tickets for select
	to authenticated
	using ((select auth.uid()) = user_id or public.is_event_host(event_id));

revoke insert, update, delete on public.tickets from anon, authenticated;

-- Inventory ----------------------------------------------------------------------------------------

-- Tickets taken per type: completed orders plus pending orders still inside their hold window.
create view public.ticket_type_availability
with (security_invoker = false)
as
select
	tt.id as ticket_type_id,
	tt.event_id,
	coalesce(sum(oi.quantity) filter (
		where o.status = 'completed' or (o.status = 'pending' and o.expires_at > now())
	), 0)::integer as taken,
	coalesce(sum(oi.quantity) filter (where o.status = 'completed'), 0)::integer as sold
from public.ticket_types tt
join public.events e on e.id = tt.event_id
left join public.order_items oi on oi.ticket_type_id = tt.id
left join public.orders o on o.id = oi.order_id
where e.status <> 'draft' or public.is_event_host(e.id) or (select auth.role()) = 'service_role'
group by tt.id, tt.event_id;

comment on view public.ticket_type_availability is
	'Per ticket type: taken (sold + held by unexpired pending orders) and sold. Public counts only.';

grant select on public.ticket_type_availability to anon, authenticated;

-- Attendee counts for listings ("312 going").
create view public.event_attendance
with (security_invoker = false)
as
select e.id as event_id, count(t.id)::integer as going
from public.events e
left join public.tickets t on t.event_id = e.id and t.status = 'valid'
where e.status <> 'draft'
group by e.id;

grant select on public.event_attendance to anon, authenticated;

-- Details only ticket holders see ------------------------------------------------------------------

create table public.event_private (
	event_id uuid primary key references public.events (id) on delete cascade,
	-- Joining link for online events.
	online_url text check (char_length(online_url) <= 500 and online_url ~ '^https?://'),
	-- Door code, parking, what to bring… included in confirmation emails and on tickets.
	attendee_info text check (char_length(attendee_info) <= 2000),
	updated_at timestamptz not null default now()
);

comment on table public.event_private is 'Event details shown only to the host and people holding a valid ticket.';

alter table public.event_private enable row level security;

create policy "Hosts and ticket holders can view private details"
	on public.event_private for select
	to authenticated
	using (
		public.is_event_host(event_id)
		or exists (
			select 1 from public.tickets t
			where t.event_id = event_private.event_id and t.user_id = (select auth.uid()) and t.status = 'valid'
		)
	);

create policy "Hosts manage private details"
	on public.event_private for all
	to authenticated
	using (public.is_event_host(event_id))
	with check (public.is_event_host(event_id));

create trigger event_private_set_updated_at
	before update on public.event_private
	for each row execute function public.set_updated_at();

-- Server-only functions ----------------------------------------------------------------------------

/**
 * Reserve tickets for a buyer. Locks the event's ticket types so concurrent checkouts can't oversell.
 * Free orders complete immediately (tickets issued); paid orders stay pending until Stripe confirms.
 * p_items: [{ "ticket_type_id": uuid, "quantity": int }, ...]
 * Returns the order id. Raises with a readable message on any problem.
 */
create function public.create_order(
	p_user_id uuid,
	p_event_id uuid,
	p_items jsonb,
	p_buyer_name text default null,
	p_buyer_email text default null,
	p_hold interval default interval '35 minutes'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_event public.events;
	v_order_id uuid;
	v_total integer := 0;
	v_count integer := 0;
	v_item record;
	v_type public.ticket_types;
	v_taken integer;
	v_event_taken integer;
begin
	select * into v_event from public.events where id = p_event_id for update;
	if v_event is null or v_event.status <> 'published' then
		raise exception 'This event is not taking registrations.' using errcode = 'P0001';
	end if;
	if v_event.ends_at < now() then
		raise exception 'This event has already ended.' using errcode = 'P0001';
	end if;

	-- One open checkout per buyer per event: drop any earlier pending hold.
	update public.orders set status = 'expired'
	where user_id = p_user_id and event_id = p_event_id and status = 'pending';

	insert into public.orders (event_id, user_id, buyer_name, buyer_email, currency, total, expires_at)
	values (p_event_id, p_user_id, p_buyer_name, p_buyer_email, v_event.currency, 0, now() + p_hold)
	returning id into v_order_id;

	for v_item in
		select (x ->> 'ticket_type_id')::uuid as ticket_type_id, (x ->> 'quantity')::integer as quantity
		from jsonb_array_elements(p_items) x
	loop
		if v_item.quantity is null or v_item.quantity <= 0 then
			continue;
		end if;

		select * into v_type from public.ticket_types
		where id = v_item.ticket_type_id and event_id = p_event_id
		for update;
		if v_type is null or v_type.is_hidden then
			raise exception 'That ticket type is not available.' using errcode = 'P0001';
		end if;
		if v_type.sales_start is not null and now() < v_type.sales_start then
			raise exception '% tickets are not on sale yet.', v_type.name using errcode = 'P0001';
		end if;
		if v_type.sales_end is not null and now() > v_type.sales_end then
			raise exception '% tickets are no longer on sale.', v_type.name using errcode = 'P0001';
		end if;
		if v_item.quantity > v_type.max_per_order then
			raise exception 'You can buy at most % % tickets per order.', v_type.max_per_order, v_type.name
				using errcode = 'P0001';
		end if;

		if v_type.quantity is not null then
			select taken into v_taken from public.ticket_type_availability where ticket_type_id = v_type.id;
			if v_taken + v_item.quantity > v_type.quantity then
				raise exception 'Only % % tickets left.', greatest(v_type.quantity - v_taken, 0), v_type.name
					using errcode = 'P0001';
			end if;
		end if;

		insert into public.order_items (order_id, ticket_type_id, quantity, unit_price)
		values (v_order_id, v_type.id, v_item.quantity, v_type.price);

		v_total := v_total + v_type.price * v_item.quantity;
		v_count := v_count + v_item.quantity;
	end loop;

	if v_count = 0 then
		raise exception 'Pick at least one ticket.' using errcode = 'P0001';
	end if;

	if v_event.capacity is not null then
		select coalesce(sum(taken), 0) into v_event_taken
		from public.ticket_type_availability where event_id = p_event_id;
		-- v_event_taken already includes this order's items.
		if v_event_taken > v_event.capacity then
			raise exception 'This event is full.' using errcode = 'P0001';
		end if;
	end if;

	update public.orders set total = v_total where id = v_order_id;

	if v_total = 0 then
		perform public.complete_order(v_order_id, null);
	end if;

	return v_order_id;
end;
$$;

/**
 * Mark an order paid/confirmed and issue one ticket per seat. Idempotent: completing an already
 * completed order is a no-op, so the Stripe webhook and the success page can both call it.
 * A pending order whose hold lapsed is still honored if the payment went through.
 * Raises P0003 if the event was cancelled meanwhile (the caller refunds instead).
 * Returns true only for the call that actually completed the order.
 */
create function public.complete_order(p_order_id uuid, p_payment_intent_id text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_order public.orders;
begin
	select * into v_order from public.orders where id = p_order_id for update;
	if v_order is null then
		raise exception 'Order not found.' using errcode = 'P0002';
	end if;
	if v_order.status = 'completed' then
		return false;
	end if;
	if v_order.status not in ('pending', 'expired') then
		raise exception 'Order % is %.', p_order_id, v_order.status using errcode = 'P0001';
	end if;
	if (select status from public.events where id = v_order.event_id) = 'cancelled' then
		raise exception 'Event for order % was cancelled.', p_order_id using errcode = 'P0003';
	end if;

	update public.orders
	set status = 'completed',
		completed_at = now(),
		expires_at = null,
		stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
	where id = p_order_id;

	insert into public.tickets (order_id, event_id, ticket_type_id, user_id, attendee_name)
	select v_order.id, v_order.event_id, oi.ticket_type_id, v_order.user_id, v_order.buyer_name
	from public.order_items oi
	cross join lateral generate_series(1, oi.quantity)
	where oi.order_id = v_order.id;
	return true;
end;
$$;

/**
 * Void an order's tickets and mark it refunded (paid) or cancelled (free).
 * Returns true only for the call that changed it (so notifications go out once).
 */
create function public.void_order(p_order_id uuid, p_refunded boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_changed boolean;
begin
	update public.orders
	set status = case when p_refunded then 'refunded'::public.order_status else 'cancelled'::public.order_status end,
		refunded_at = case when p_refunded then now() end,
		expires_at = null
	-- 'expired' too: a payment can land after its hold lapsed (e.g. the event was cancelled mid-checkout).
	where id = p_order_id and status in ('pending', 'expired', 'completed');
	v_changed := found;

	update public.tickets set status = 'void' where order_id = p_order_id and status = 'valid';
	return v_changed;
end;
$$;

/** Door check-in by ticket code. Host-callable (checks ownership itself). */
create function public.check_in_ticket(p_event_id uuid, p_code text, p_undo boolean default false)
returns public.tickets
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_ticket public.tickets;
begin
	if not public.is_event_host(p_event_id) then
		raise exception 'Only the host can check people in.' using errcode = '42501';
	end if;

	update public.tickets
	set checked_in_at = case when p_undo then null else coalesce(checked_in_at, now()) end
	where event_id = p_event_id and code = upper(trim(p_code)) and status = 'valid'
	returning * into v_ticket;

	if v_ticket is null then
		raise exception 'No valid ticket with code % for this event.', upper(trim(p_code)) using errcode = 'P0002';
	end if;
	return v_ticket;
end;
$$;

revoke execute on function public.create_order(uuid, uuid, jsonb, text, text, interval) from public, anon, authenticated;
revoke execute on function public.complete_order(uuid, text) from public, anon, authenticated;
revoke execute on function public.void_order(uuid, boolean) from public, anon, authenticated;
grant execute on function public.create_order(uuid, uuid, jsonb, text, text, interval) to service_role;
grant execute on function public.complete_order(uuid, text) to service_role;
grant execute on function public.void_order(uuid, boolean) to service_role;

revoke execute on function public.check_in_ticket(uuid, text, boolean) from public, anon;
grant execute on function public.check_in_ticket(uuid, text, boolean) to authenticated;

-- Cover images -------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-covers', 'event-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Members upload into a folder named after their user id: event-covers/<uid>/<file>.
create policy "Members upload their own event covers"
	on storage.objects for insert
	to authenticated
	with check (bucket_id = 'event-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Members replace their own event covers"
	on storage.objects for update
	to authenticated
	using (bucket_id = 'event-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Members delete their own event covers"
	on storage.objects for delete
	to authenticated
	using (bucket_id = 'event-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);
