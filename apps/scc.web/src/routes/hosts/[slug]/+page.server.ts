import { error } from '@sveltejs/kit';
import { listingSelect } from '#lib/events.js';
import { hostColumns, withGoing } from '#lib/server/events.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const { data: host } = await supabase.from('hosts').select(hostColumns).eq('slug', params.slug).maybeSingle();
	if (!host) error(404, 'Host not found.');

	const { data } = await supabase
		.from('events')
		.select(listingSelect)
		.eq('host_id', host.id)
		.eq('status', 'published')
		.order('starts_at');
	const events = await withGoing(supabase, data ?? []);
	const now = Date.now();

	return {
		host,
		upcoming: events.filter((e) => Date.parse(e.ends_at) >= now),
		past: events.filter((e) => Date.parse(e.ends_at) < now).reverse()
	};
};
