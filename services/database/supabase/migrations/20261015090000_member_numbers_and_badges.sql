-- Member numbers and early-member badges.
--
-- Every account gets a permanent member number in signup order (shared by every site, like the
-- account itself). Badges follow from the number and are never re-awarded: a deleted account keeps
-- its number used up, so "first 10" always means the first ten people who joined.
--   #1–10   founding_10
--   #11–100 first_100
--   #101–1000 first_1000

create sequence public.profiles_member_number_seq;

alter table public.profiles
	add column member_number bigint unique,
	-- When the member saw their badge celebration (confetti); null = not yet.
	add column badge_celebrated_at timestamptz;

-- Existing members are numbered in the order they signed up.
with ordered as (
	select id, row_number() over (order by created_at, id) as n from public.profiles
)
update public.profiles p set member_number = o.n from ordered o where o.id = p.id;

select setval(
	'public.profiles_member_number_seq',
	coalesce((select max(member_number) from public.profiles), 0) + 1,
	false
);

alter sequence public.profiles_member_number_seq owned by public.profiles.member_number;
alter table public.profiles
	alter column member_number set default nextval('public.profiles_member_number_seq'),
	alter column member_number set not null;

comment on column public.profiles.member_number is 'Permanent member number in signup order (1 = first member). Never reused.';

-- Members may mark their own celebration as seen.
grant update (badge_celebrated_at) on public.profiles to authenticated;

create function public.member_badge(p_member_number bigint)
returns text
language sql
immutable
set search_path = ''
as $$
	select case
		when p_member_number <= 10 then 'founding_10'
		when p_member_number <= 100 then 'first_100'
		when p_member_number <= 1000 then 'first_1000'
	end;
$$;

-- Directory: what members can see about each other (no emails, no signup metadata). Signed-in only;
-- profiles itself stays readable by its owner alone.
create view public.members
with (security_invoker = false)
as
select
	id,
	user_id,
	member_number,
	display_name,
	bio,
	avatar_icon,
	avatar_hue,
	created_at,
	public.member_badge(member_number) as badge
from public.profiles;

comment on view public.members is 'Member directory: public profile fields plus member number and badge. Signed-in members only.';

revoke all on public.members from anon, authenticated;
grant select on public.members to authenticated;

-- Headline numbers for everyone, signed in or not: how many members, and how far the badge runs are.
create function public.member_stats()
returns table (total bigint, latest_number bigint)
language sql
stable
security definer
set search_path = ''
as $$
	-- latest_number comes from the sequence, so deleted accounts still count as claimed spots.
	select
		(select count(*) from public.profiles),
		(select case when is_called then last_value else last_value - 1 end from public.profiles_member_number_seq);
$$;

revoke execute on function public.member_stats() from public;
grant execute on function public.member_stats() to anon, authenticated;
