import { error } from '@sveltejs/kit';
import { place } from '#lib/events.js';
import { eventIcs } from '#lib/ics.js';
import type { RequestHandler } from './$types';

/** "Add to calendar" download. Public details only; the joining link stays in the ticket email. */
export const GET: RequestHandler = async ({ params, url, locals: { supabase } }) => {
	const { data: e } = await supabase
		.from('events')
		.select('id, slug, title, summary, starts_at, ends_at, is_online, venue_name, address, city, country, status')
		.eq('slug', params.slug)
		.maybeSingle();
	if (!e) error(404, 'Event not found.');

	const location = e.is_online ? 'Online' : [e.venue_name, e.address, e.city, e.country].filter(Boolean).join(', ') || place(e);
	return new Response(
		eventIcs({ ...e, location, url: `${url.origin}/event/${e.slug}`, cancelled: e.status === 'cancelled' }),
		{
			headers: {
				'content-type': 'text/calendar; charset=utf-8',
				'content-disposition': `attachment; filename="${e.slug}.ics"`
			}
		}
	);
};
