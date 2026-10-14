import { formatDateLong, listingSelect, place, priceLabel, toTicketEvent } from '#lib/events.js';
import { withGoing } from '#lib/server/events.js';
import type { PageServerLoad } from './$types';

const DAY = 86_400_000;

/**
 * Real events for the landing page's event sections. Each section falls back to the demo
 * content in landing.ts while the calendar is still empty (pre-launch).
 */
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const now = new Date();
	const weekOut = new Date(now.getTime() + 7 * DAY).toISOString();
	const upcoming = () =>
		supabase.from('events').select(listingSelect).eq('status', 'published').gte('ends_at', now.toISOString()).order('starts_at');

	const [{ data: soon }, { data: festivals }, { count: weekCount }] = await Promise.all([
		upcoming().limit(12),
		upcoming().eq('category', 'festival').limit(7),
		supabase
			.from('events')
			.select('id', { count: 'exact', head: true })
			.eq('status', 'published')
			.gte('ends_at', now.toISOString())
			.lt('starts_at', weekOut)
	]);

	const listed = await withGoing(supabase, [...(soon ?? []), ...(festivals ?? [])]);
	const going = new Map(listed.map((e) => [e.id, e.going]));
	const withCount = <T extends { id: string }>(rows: T[]) => rows.map((e) => ({ ...e, going: going.get(e.id) ?? 0 }));

	const soonCards = withCount(soon ?? []);
	const thisWeek = soonCards.filter((e) => e.starts_at < weekOut).map(toTicketEvent);
	const festivalRows = withCount(festivals ?? []);

	return {
		// Hero fan: the next three events, most popular in front.
		heroStack: soonCards.slice(0, 3).sort((a, b) => a.going - b.going).map(toTicketEvent),
		thisWeek,
		weekCount: weekCount ?? 0,
		festivals: festivalRows.slice(0, 3).map((e) => ({
			slug: e.slug,
			title: e.title,
			image: e.cover_image_url || '/img/event-festival-nyc.webp',
			where: `${formatDateLong(e.starts_at, e.timezone).replace(/^\w+, /, '').toUpperCase()} · ${e.venue_name ? `${e.venue_name}, ` : ''}${place(e)}`,
			blurb: e.summary ?? '',
			price: priceLabel(e.ticket_types.filter((t) => !t.is_hidden).map((t) => t.price), e.currency).toUpperCase(),
			going: e.going.toLocaleString('en-US')
		})),
		moreFestivals: festivalRows.slice(3).map((e) => ({
			slug: e.slug,
			label: `${e.title} · ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: e.timezone }).format(new Date(e.starts_at))}`
		}))
	};
};
