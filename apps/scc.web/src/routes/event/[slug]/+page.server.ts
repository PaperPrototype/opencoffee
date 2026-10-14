import { error, fail, redirect } from '@sveltejs/kit';
import { orderFee } from '#lib/money.js';
import { hostColumns } from '#lib/server/events.js';
import { sendOrderConfirmation } from '#lib/server/email.js';
import { expireOpenOrders, expireOrder } from '#lib/server/orders.js';
import { stripe } from '#lib/server/stripe.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals: { supabase, user } }) => {
	// RLS shows drafts only to their host, so a draft here is the host previewing it.
	const { data: event } = await supabase.from('events').select('*').eq('slug', params.slug).maybeSingle();
	if (!event) error(404, 'Event not found.');

	// Back from an abandoned Stripe checkout: release the held tickets straight away.
	const cancelled = url.searchParams.get('cancelled');
	if (cancelled && user) {
		const { data: order } = await supabase.from('orders').select('id').eq('id', cancelled).eq('user_id', user.id).maybeSingle();
		if (order) await expireOrder(order.id);
	}

	const [{ data: host }, { data: ticketTypes }, { data: availability }, { data: attendance }, mine, secret] = await Promise.all([
		supabase.from('hosts').select(hostColumns).eq('id', event.host_id).single(),
		supabase.from('ticket_types').select('*').eq('event_id', event.id).eq('is_hidden', false).order('sort_order').order('price'),
		supabase.from('ticket_type_availability').select('ticket_type_id, taken').eq('event_id', event.id),
		supabase.from('event_attendance').select('going').eq('event_id', event.id).maybeSingle(),
		user
			? supabase.from('tickets').select('id, code').eq('event_id', event.id).eq('user_id', user.id).eq('status', 'valid')
			: Promise.resolve({ data: [] }),
		// RLS: only the host and people holding a valid ticket get a row back.
		user
			? supabase.from('event_private').select('online_url, attendee_info').eq('event_id', event.id).maybeSingle()
			: Promise.resolve({ data: null })
	]);

	const taken = new Map((availability ?? []).map((a) => [a.ticket_type_id, a.taken ?? 0]));
	const totalTaken = [...taken.values()].reduce((a, b) => a + b, 0);
	const eventLeft = event.capacity == null ? Infinity : Math.max(event.capacity - totalTaken, 0);
	const now = Date.now();

	const tickets = (ticketTypes ?? []).map((t) => {
		const left = Math.min(t.quantity == null ? Infinity : Math.max(t.quantity - (taken.get(t.id) ?? 0), 0), eventLeft);
		const notYet = t.sales_start != null && now < Date.parse(t.sales_start);
		const over = t.sales_end != null && now > Date.parse(t.sales_end);
		return {
			...t,
			left: Number.isFinite(left) ? left : null,
			state: notYet ? ('soon' as const) : over ? ('ended' as const) : left <= 0 ? ('sold_out' as const) : ('on_sale' as const)
		};
	});

	return {
		event,
		host: host!,
		tickets,
		going: attendance?.going ?? 0,
		myTickets: mine.data ?? [],
		secret: secret.data,
		isHost: !!user && host?.user_id === user.id
	};
};

export const actions: Actions = {
	register: async ({ request, params, url, locals: { supabase, user } }) => {
		if (!user) redirect(303, `/auth?next=${encodeURIComponent(`/event/${params.slug}`)}`);

		const { data: event } = await supabase
			.from('events')
			.select('id, slug, title, status, currency, host_id, cover_image_url')
			.eq('slug', params.slug)
			.maybeSingle();
		if (!event || event.status !== 'published') return fail(400, { message: 'This event is not taking registrations.' });

		const form = await request.formData();
		const items = [...form.entries()]
			.filter(([key]) => key.startsWith('qty:'))
			.map(([key, value]) => ({ ticket_type_id: key.slice(4), quantity: Number(value) || 0 }))
			.filter((i) => i.quantity > 0);
		if (items.length === 0) return fail(400, { message: 'Pick at least one ticket.' });

		const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).single();
		const buyerName = String(form.get('name') ?? '').trim().slice(0, 120) || profile?.display_name || null;

		// Starting over: close any checkout this buyer still has open for the event so it can't be paid twice.
		await expireOpenOrders(user.id, event.id);

		const { data: orderId, error: orderError } = await supabaseAdmin.rpc('create_order', {
			p_user_id: user.id,
			p_event_id: event.id,
			p_items: items,
			p_buyer_name: buyerName ?? undefined,
			p_buyer_email: user.email ?? undefined
		});
		if (orderError || !orderId) return fail(400, { message: orderError?.message ?? 'Could not reserve tickets.' });

		const { data: order } = await supabaseAdmin
			.from('orders')
			.select('id, status, total, order_items(quantity, unit_price, ticket_types(name))')
			.eq('id', orderId)
			.single();

		// Free: create_order already issued the tickets.
		if (!order || order.status === 'completed') {
			await sendOrderConfirmation(orderId, url.origin);
			redirect(303, `/event/${event.slug}/confirmed?order=${orderId}`);
		}

		const { data: host } = await supabaseAdmin
			.from('hosts')
			.select('stripe_account_id, stripe_transfers_enabled')
			.eq('id', event.host_id)
			.single();
		if (!host?.stripe_account_id || !host.stripe_transfers_enabled) {
			await expireOrder(orderId);
			return fail(400, { message: "This host can't take payments yet. Try again later." });
		}

		const fee = orderFee(
			order.order_items.map((i) => ({ price: i.unit_price, quantity: i.quantity })),
			event.currency
		);

		let checkoutUrl: string;
		try {
			const session = await stripe().checkout.sessions.create(
				{
					mode: 'payment',
					// Cards (incl. Apple/Google Pay) and Link confirm instantly. Delayed methods like bank debits could
					// settle after the ticket hold lapses and oversell the event.
					allowed_payment_method_types: ['card', 'link'],
					client_reference_id: orderId,
					customer_email: user.email,
					metadata: { order_id: orderId, event_id: event.id },
					line_items: order.order_items.map((i) => ({
						quantity: i.quantity,
						price_data: {
							currency: event.currency,
							unit_amount: i.unit_price,
							product_data: {
								name: `${i.ticket_types?.name ?? 'Ticket'} — ${event.title}`,
								// Stripe only shows https images.
								...(event.cover_image_url?.startsWith('https://') ? { images: [event.cover_image_url] } : {})
							}
						}
					})),
					payment_intent_data: {
						application_fee_amount: fee,
						transfer_data: { destination: host.stripe_account_id },
						metadata: { order_id: orderId, event_id: event.id }
					},
					// Stripe's minimum; the order's hold in create_order runs a few minutes longer.
					expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
					success_url: `${url.origin}/event/${event.slug}/confirmed?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
					cancel_url: `${url.origin}/event/${event.slug}?cancelled=${orderId}`
				},
				{ idempotencyKey: `checkout-${orderId}` }
			);
			await supabaseAdmin
				.from('orders')
				.update({ stripe_checkout_session_id: session.id, platform_fee: fee })
				.eq('id', orderId);
			checkoutUrl = session.url!;
		} catch (err) {
			await expireOrder(orderId);
			console.error('Stripe checkout failed', err);
			return fail(502, { message: 'Could not start checkout. Please try again.' });
		}

		redirect(303, checkoutUrl);
	}
};
