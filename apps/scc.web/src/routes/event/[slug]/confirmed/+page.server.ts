import { error, redirect } from '@sveltejs/kit';
import { fulfillCheckoutSession } from '#lib/server/orders.js';
import { qrSvg } from '#lib/server/qr.js';
import { stripe } from '#lib/server/stripe.js';
import type { PageServerLoad } from './$types';

const orderSelect =
	'id, status, total, currency, stripe_checkout_session_id, events(id, slug, title, starts_at, ends_at, timezone, is_online, city, country, venue_name, status), tickets(code, status, checked_in_at, attendee_name, ticket_types(name))';

export const load: PageServerLoad = async ({ params, url, locals: { supabase, user } }) => {
	if (!user) redirect(303, `/auth?next=${encodeURIComponent(url.pathname + url.search)}`);
	const orderId = url.searchParams.get('order');
	if (!orderId) redirect(303, `/event/${params.slug}`);

	const fetchOrder = () => supabase.from('orders').select(orderSelect).eq('id', orderId).eq('user_id', user.id).maybeSingle();
	let { data: order } = await fetchOrder();
	if (!order) error(404, 'Order not found.');

	// The webhook usually beats the buyer back here; if not, confirm with Stripe directly.
	const sessionId = url.searchParams.get('session_id');
	if (order.status !== 'completed' && sessionId && sessionId === order.stripe_checkout_session_id) {
		const session = await stripe().checkout.sessions.retrieve(sessionId);
		if (await fulfillCheckoutSession(session, url.origin)) ({ data: order } = await fetchOrder());
	}

	const { data: secret } = await supabase
		.from('event_private')
		.select('online_url, attendee_info')
		.eq('event_id', order!.events!.id)
		.maybeSingle();

	return {
		order: order!,
		secret,
		tickets: await Promise.all(
			order!.tickets.map(async (t) => ({
				code: t.code,
				status: t.status,
				checked_in_at: t.checked_in_at,
				attendee: t.attendee_name,
				type: t.ticket_types?.name ?? 'Ticket',
				qr: await qrSvg(t.code)
			}))
		)
	};
};
