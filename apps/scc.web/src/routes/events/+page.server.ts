import { isCategory, listingSelect } from '#lib/events.js';
import { withGoing } from '#lib/server/events.js';
import type { PageServerLoad } from './$types';

const DAY = 86_400_000;

/** [from, to) window for a "when" filter. Weekend runs Fri 00:00 → Mon 00:00 (server time). */
function window(when: string, now = new Date()): [Date, Date] | null {
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const at = (days: number) => new Date(today.getTime() + days * DAY);
	switch (when) {
		case 'today':
			return [now, at(1)];
		case 'weekend': {
			const day = today.getDay(); // 0 = Sun … 6 = Sat
			const untilMonday = (8 - day) % 7 || 7;
			return [day === 0 || day >= 5 ? now : at(5 - day), at(untilMonday)];
		}
		case 'week':
			return [now, at(7)];
		case 'month':
			return [now, at(30)];
		default:
			return null;
	}
}

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const q = url.searchParams.get('q')?.trim().slice(0, 100) ?? '';
	const category = url.searchParams.get('category') ?? '';
	const when = url.searchParams.get('when') ?? '';
	const price = url.searchParams.get('price') ?? '';
	const city = url.searchParams.get('city')?.trim().slice(0, 100) ?? '';

	let query = supabase
		.from('events')
		.select(listingSelect)
		.eq('status', 'published')
		.gte('ends_at', new Date().toISOString())
		.order('starts_at')
		.limit(120);

	// PostgREST filter values: strip characters that would break the or()/ilike syntax.
	const safe = (s: string) => s.replace(/[%,()*"\\:]/g, ' ');
	if (q) query = query.or(`title.ilike.*${safe(q)}*,summary.ilike.*${safe(q)}*,city.ilike.*${safe(q)}*`);
	if (city) query = query.or(`city.ilike.*${safe(city)}*,country.ilike.*${safe(city)}*`);
	if (isCategory(category)) query = query.eq('category', category);
	const range = window(when);
	if (range) query = query.gte('ends_at', range[0].toISOString()).lt('starts_at', range[1].toISOString());

	const { data } = await query;
	let events = await withGoing(supabase, data ?? []);

	if (price === 'free' || price === 'paid') {
		events = events.filter((e) => {
			const paid = e.ticket_types.some((t) => !t.is_hidden && t.price > 0);
			return price === 'paid' ? paid : !paid;
		});
	}

	return { events, filters: { q, category, when, price, city } };
};
