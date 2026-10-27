import { badgeFor } from '#lib/badges.js';
import type { PageServerLoad } from './$types';

// Public on purpose: it's what "See an example Coffee CV" promises before anyone signs up.
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: stats } = await supabase.rpc('member_stats').single();
	const next = (stats?.latest_number ?? 0) + 1;
	return { next: { number: next, badge: badgeFor(next)?.id ?? null } };
};
