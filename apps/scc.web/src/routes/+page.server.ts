import { fail } from '@sveltejs/kit';
import { badgeFor, badgeRuns } from '#lib/badges.js';
import { formatDateLong, listingSelect, place, priceLabel, toTicketEvent } from '#lib/events.js';
import { sendContactMessage } from '#lib/server/email.js';
import { withGoing } from '#lib/server/events.js';
import type { Actions, PageServerLoad } from './$types';

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

	const [{ data: soon }, { data: festivals }, { count: weekCount }, { data: stats }] = await Promise.all([
		upcoming().limit(12),
		upcoming().eq('category', 'festival').limit(7),
		supabase
			.from('events')
			.select('id', { count: 'exact', head: true })
			.eq('status', 'published')
			.gte('ends_at', now.toISOString())
			.lt('starts_at', weekOut),
		supabase.rpc('member_stats').single()
	]);

	const listed = await withGoing(supabase, [...(soon ?? []), ...(festivals ?? [])]);
	const going = new Map(listed.map((e) => [e.id, e.going]));
	const withCount = <T extends { id: string }>(rows: T[]) => rows.map((e) => ({ ...e, going: going.get(e.id) ?? 0 }));

	const soonCards = withCount(soon ?? []);
	const thisWeek = soonCards.filter((e) => e.starts_at < weekOut).map(toTicketEvent);
	const festivalRows = withCount(festivals ?? []);

	// Founding classes: real progress, and the number the next person to join will get.
	const latest = stats?.latest_number ?? 0;

	return {
		members: { total: stats?.total ?? 0, runs: badgeRuns(latest), next: { number: latest + 1, badge: badgeFor(latest + 1)?.id ?? null } },
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

export const actions: Actions = {
	/** "Say hello": emails the founder. */
	contact: async ({ request }) => {
		const form = await request.formData();
		// Honeypot: people never see this field, bots fill it in.
		if (form.get('company')) return { sent: true };
		const name = String(form.get('name') ?? '').trim().slice(0, 120);
		const email = String(form.get('email') ?? '').trim().slice(0, 254);
		const body = String(form.get('message') ?? '').trim().slice(0, 5000);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, { contactError: 'Add an email so the founder can write back.', name, email, body });
		if (body.length < 2) return fail(400, { contactError: 'Write a message first.', name, email, body });
		try {
			await sendContactMessage({ name, email, body });
		} catch (err) {
			console.error('Contact message failed', err);
			return fail(500, { contactError: 'That didn’t send. Email hello@specialtycoffeecommunity.com directly.', name, email, body });
		}
		return { sent: true };
	}
};
