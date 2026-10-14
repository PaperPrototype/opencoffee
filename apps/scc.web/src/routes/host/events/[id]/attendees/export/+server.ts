import { requireHostedEvent } from '#lib/server/events.js';
import { slugify } from '#lib/events.js';
import { toMajor } from '#lib/money.js';
import type { RequestHandler } from './$types';

const csvCell = (value: unknown) => {
	const s = value == null ? '' : String(value);
	// Quote everything; neutralise spreadsheet formulas.
	return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
};

/** Guest list as CSV: one row per ticket. */
export const GET: RequestHandler = async ({ params, locals: { supabase, user } }) => {
	const { event } = await requireHostedEvent(supabase, user!.id, params.id);
	const { data: tickets } = await supabase
		.from('tickets')
		.select('code, status, checked_in_at, attendee_name, created_at, ticket_types(name, price), orders(id, buyer_email, status)')
		.eq('event_id', event.id)
		.order('created_at');

	const rows = [
		['Ticket code', 'Name', 'Email', 'Ticket type', `Price (${event.currency.toUpperCase()})`, 'Status', 'Checked in at', 'Order', 'Issued at'],
		...(tickets ?? []).map((t) => [
			t.code,
			t.attendee_name,
			t.orders?.buyer_email,
			t.ticket_types?.name,
			t.ticket_types ? toMajor(t.ticket_types.price, event.currency) : '',
			t.status,
			t.checked_in_at,
			t.orders?.id,
			t.created_at
		])
	];

	return new Response(rows.map((r) => r.map(csvCell).join(',')).join('\r\n'), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="${slugify(event.title) || 'event'}-guests.csv"`,
			'cache-control': 'private, no-store'
		}
	});
};
