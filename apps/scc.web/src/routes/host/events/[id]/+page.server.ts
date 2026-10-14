import { fail, redirect } from '@sveltejs/kit';
import { parseEventForm, parseTicketForm, uploadCover } from '#lib/server/event-form.js';
import { requireHostedEvent } from '#lib/server/events.js';
import { expireOrder, refundOrder } from '#lib/server/orders.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	const { host, event } = await requireHostedEvent(supabase, user!.id, params.id);

	const [{ data: ticketTypes }, { data: availability }, { count: orders }, { data: secret }] = await Promise.all([
		supabase.from('ticket_types').select('*').eq('event_id', event.id).order('sort_order').order('created_at'),
		supabase.from('ticket_type_availability').select('ticket_type_id, sold, taken').eq('event_id', event.id),
		supabase.from('orders').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'completed'),
		supabase.from('event_private').select('online_url, attendee_info').eq('event_id', event.id).maybeSingle()
	]);
	const sold = new Map((availability ?? []).map((a) => [a.ticket_type_id, a.sold ?? 0]));

	return {
		host,
		event,
		ticketTypes: (ticketTypes ?? []).map((t) => ({ ...t, sold: sold.get(t.id) ?? 0 })),
		hasOrders: (orders ?? 0) > 0,
		secret: secret ?? { online_url: null, attendee_info: null }
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		const form = await request.formData();

		const parsed = parseEventForm(form);
		if (parsed.error) return fail(400, { message: parsed.error });

		if (parsed.values!.currency !== event.currency) {
			// Prices are stored in minor units of the currency, so switching would silently reprice them
			// (1000 cents → ¥1000). Make the host re-enter paid prices instead.
			const { count } = await supabase.from('ticket_types').select('id', { count: 'exact', head: true }).eq('event_id', event.id).gt('price', 0);
			if (count) return fail(400, { message: 'Remove or make paid tickets free before changing the currency, then set their prices again.' });
		}

		const cover = await uploadCover(supabase, user!.id, form);
		if (cover.error) return fail(400, { message: cover.error });

		const { error } = await supabase
			.from('events')
			.update({ ...parsed.values!, ...(cover.url ? { cover_image_url: cover.url } : {}) })
			.eq('id', event.id);
		if (error) return fail(400, { message: error.message });

		const { error: secretError } = await supabase
			.from('event_private')
			.upsert({ event_id: event.id, online_url: parsed.secret!.online_url, attendee_info: parsed.secret!.attendee_info });
		if (secretError) return fail(400, { message: secretError.message });
		return { saved: 'details' };
	},

	saveTicket: async ({ request, params, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		const parsed = parseTicketForm(form, event);
		if (parsed.error) return fail(400, { message: parsed.error, ticketId: id || 'new' });

		if (parsed.values!.price > 0) {
			const { data: host } = await supabase.from('hosts').select('stripe_transfers_enabled').eq('id', event.host_id).single();
			if (!host?.stripe_transfers_enabled) {
				return fail(400, { message: 'Connect Stripe from your host dashboard before adding paid tickets.', ticketId: id || 'new' });
			}
		}

		if (id) {
			const { data: existing } = await supabase.from('ticket_type_availability').select('sold').eq('ticket_type_id', id).maybeSingle();
			const { data: current } = await supabase.from('ticket_types').select('price').eq('id', id).single();
			if ((existing?.sold ?? 0) > 0 && current && current.price !== parsed.values!.price) {
				return fail(400, { message: "This ticket has sales, so its price is locked. Add a new ticket type instead.", ticketId: id });
			}
			if (parsed.values!.quantity != null && parsed.values!.quantity < (existing?.sold ?? 0)) {
				return fail(400, { message: `${existing?.sold} already sold — quantity can't go below that.`, ticketId: id });
			}
			const { error } = await supabase.from('ticket_types').update(parsed.values!).eq('id', id).eq('event_id', event.id);
			if (error) return fail(400, { message: error.message, ticketId: id });
		} else {
			const { count } = await supabase.from('ticket_types').select('id', { count: 'exact', head: true }).eq('event_id', event.id);
			const { error } = await supabase.from('ticket_types').insert({ ...parsed.values!, event_id: event.id, sort_order: count ?? 0 });
			if (error) return fail(400, { message: error.message, ticketId: 'new' });
		}
		return { saved: 'ticket' };
	},

	deleteTicket: async ({ request, params, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		const id = String((await request.formData()).get('id') ?? '');

		const { count } = await supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('ticket_type_id', id);
		if (count) {
			// Orders reference it; hide it from sale instead.
			await supabase.from('ticket_types').update({ is_hidden: true }).eq('id', id).eq('event_id', event.id);
			return { saved: 'ticket', note: 'That ticket has orders, so it was hidden instead of deleted.' };
		}
		await supabase.from('ticket_types').delete().eq('id', id).eq('event_id', event.id);
		return { saved: 'ticket' };
	},

	publish: async ({ params, locals: { supabase, user } }) => {
		const { host, event } = await requireHostedEvent(supabase, user!.id, params.id);
		if (event.status !== 'draft') return fail(400, { message: 'Only drafts can be published.' });
		if (Date.parse(event.ends_at) < Date.now()) return fail(400, { message: 'This event is already over — update the dates first.' });

		const { data: types } = await supabase.from('ticket_types').select('price, is_hidden').eq('event_id', event.id);
		const onSale = (types ?? []).filter((t) => !t.is_hidden);
		if (onSale.length === 0) return fail(400, { message: 'Add at least one ticket (it can be free) before publishing.' });
		if (onSale.some((t) => t.price > 0) && !host.stripe_transfers_enabled) {
			return fail(400, { message: 'This event has paid tickets — connect Stripe from your host dashboard first.' });
		}

		await supabaseAdmin
			.from('events')
			.update({ status: 'published', published_at: event.published_at ?? new Date().toISOString() })
			.eq('id', event.id);
		return { saved: 'published' };
	},

	unpublish: async ({ params, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('event_id', event.id).in('status', ['completed', 'pending']);
		if (count) return fail(400, { message: 'People already have tickets. Cancel the event instead (everyone is refunded).' });
		await supabaseAdmin.from('events').update({ status: 'draft' }).eq('id', event.id).eq('status', 'published');
		return { saved: 'unpublished' };
	},

	/** Cancel the event: refund every paid order, void every ticket. */
	cancel: async ({ request, params, url, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		if ((await request.formData()).get('confirm') !== event.title) {
			return fail(400, { message: 'Type the event title exactly to confirm cancelling.' });
		}

		// Stop new sales first so nothing slips in while refunds run.
		await supabaseAdmin.from('events').update({ status: 'cancelled' }).eq('id', event.id);
		// Close open checkouts too. One paid in the meantime is refunded on fulfilment (complete_order refuses it).
		const { data: pending } = await supabaseAdmin.from('orders').select('id').eq('event_id', event.id).eq('status', 'pending');
		await Promise.all((pending ?? []).map((o) => expireOrder(o.id)));

		const { data: orders } = await supabaseAdmin
			.from('orders')
			.select('id, total, status, stripe_payment_intent_id')
			.eq('event_id', event.id)
			.eq('status', 'completed');

		const failed: string[] = [];
		for (const order of orders ?? []) {
			try {
				await refundOrder(order, url.origin, 'event_cancelled');
			} catch (err) {
				console.error(`Refund failed for order ${order.id}`, err);
				failed.push(order.id);
			}
		}
		if (failed.length) {
			return fail(502, {
				message: `Event cancelled, but ${failed.length} refund(s) failed. Retry them from the guest list.`
			});
		}
		return { saved: 'cancelled' };
	},

	delete: async ({ params, locals: { supabase, user } }) => {
		const { event } = await requireHostedEvent(supabase, user!.id, params.id);
		if (event.status !== 'draft') return fail(400, { message: 'Only drafts can be deleted. Cancel a published event instead.' });
		const { error } = await supabase.from('events').delete().eq('id', event.id);
		if (error) return fail(400, { message: 'This draft has order history and cannot be deleted.' });
		redirect(303, '/host');
	}
};
