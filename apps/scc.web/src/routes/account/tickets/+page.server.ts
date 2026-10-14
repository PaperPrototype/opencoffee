import { qrSvg } from '#lib/server/qr.js';
import type { PageServerLoad } from './$types';

// hooks.server.ts redirects signed-out visitors away from /account, so `user` is set here.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data } = await supabase
		.from('tickets')
		.select(
			'code, status, checked_in_at, attendee_name, created_at, ticket_types(name), events(id, slug, title, starts_at, ends_at, timezone, is_online, city, country, venue_name, status)'
		)
		.eq('user_id', user!.id)
		.order('created_at', { ascending: false });

	const tickets = await Promise.all(
		(data ?? [])
			.filter((t) => t.events)
			.map(async (t) => ({
				secret: null as { online_url: string | null; attendee_info: string | null } | null,
				event: t.events!,
				ticket: {
					code: t.code,
					status: t.status,
					checked_in_at: t.checked_in_at,
					attendee: t.attendee_name,
					type: t.ticket_types?.name ?? 'Ticket',
					qr: await qrSvg(t.code)
				}
			}))
	);

	// RLS returns private details only for events the member holds a valid ticket for.
	const eventIds = [...new Set(tickets.map((t) => t.event.id))];
	const { data: secrets } = eventIds.length
		? await supabase.from('event_private').select('event_id, online_url, attendee_info').in('event_id', eventIds)
		: { data: [] };
	const secretByEvent = new Map((secrets ?? []).map((s) => [s.event_id, s]));
	for (const t of tickets) Object.assign(t, { secret: secretByEvent.get(t.event.id) ?? null });

	const now = Date.now();
	const byStart = (a: (typeof tickets)[number], b: (typeof tickets)[number]) =>
		Date.parse(a.event.starts_at) - Date.parse(b.event.starts_at);
	return {
		upcoming: tickets.filter((t) => Date.parse(t.event.ends_at) >= now).sort(byStart),
		past: tickets.filter((t) => Date.parse(t.event.ends_at) < now).sort((a, b) => byStart(b, a))
	};
};
