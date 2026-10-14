import { fail } from '@sveltejs/kit';
import { requireHostedEvent } from '#lib/server/events.js';
import { refundOrder } from '#lib/server/orders.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	const { event } = await requireHostedEvent(supabase, user!.id, params.id);

	const { data: orders } = await supabase
		.from('orders')
		.select('id, status, buyer_name, buyer_email, total, platform_fee, currency, completed_at, refunded_at, tickets(id, code, status, checked_in_at, attendee_name, ticket_types(name))')
		.eq('event_id', event.id)
		.in('status', ['completed', 'refunded', 'cancelled'])
		.order('completed_at', { ascending: false });

	const list = orders ?? [];
	const valid = list.flatMap((o) => o.tickets).filter((t) => t.status === 'valid');
	const completed = list.filter((o) => o.status === 'completed');
	return {
		event,
		orders: list,
		stats: {
			tickets: valid.length,
			checkedIn: valid.filter((t) => t.checked_in_at).length,
			gross: completed.reduce((s, o) => s + o.total, 0),
			fees: completed.reduce((s, o) => s + o.platform_fee, 0)
		}
	};
};

export const actions: Actions = {
	checkIn: async ({ request, params, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		const form = await request.formData();
		const code = String(form.get('code') ?? '').trim();
		if (!code) return fail(400, { message: 'Enter a ticket code.' });

		const { data, error } = await supabase.rpc('check_in_ticket', {
			p_event_id: event.id,
			p_code: code,
			p_undo: form.get('undo') === '1'
		});
		if (error) return fail(400, { message: error.message, code });
		return { checkedIn: data.code, undo: form.get('undo') === '1' };
	},

	refund: async ({ request, params, url, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		const orderId = String((await request.formData()).get('order') ?? '');

		// Host RLS: only this event's orders are visible.
		const { data: order } = await supabase
			.from('orders')
			.select('id, total, status, stripe_payment_intent_id')
			.eq('id', orderId)
			.eq('event_id', event.id)
			.maybeSingle();
		if (!order) return fail(404, { message: 'Order not found.' });

		try {
			await refundOrder(order, url.origin, 'host');
		} catch (err) {
			console.error(`Refund failed for order ${order.id}`, err);
			return fail(502, { message: err instanceof Error ? err.message : 'Refund failed.' });
		}
		return { refunded: order.id };
	}
};
