import { badgeFor, badgeRuns, badges } from '#lib/badges.js';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 48;

export const load: PageServerLoad = async ({ url, locals: { supabase, user } }) => {
	const { data: stats } = await supabase.rpc('member_stats').single();
	const total = stats?.total ?? 0;
	const latest = stats?.latest_number ?? 0;

	const runs = badgeRuns(latest);

	// What someone joining right now would get (signed-out pitch).
	const next = { number: latest + 1, badge: badgeFor(latest + 1)?.label ?? null };

	// The directory itself is for members only (the members view isn't readable signed out).
	if (!user) return { total, runs, next, members: null, filters: null, page: 1, pages: 1, me: null };

	const q = url.searchParams.get('q')?.trim().slice(0, 80) ?? '';
	const badge = url.searchParams.get('badge') ?? '';
	const sort = url.searchParams.get('sort') === 'newest' ? 'newest' : 'first';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	let query = supabase
		.from('members')
		.select('id, user_id, member_number, display_name, headline, location, bio, avatar_icon, avatar_hue, created_at, badge', {
			count: 'exact'
		})
		.order('member_number', { ascending: sort === 'first' })
		.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
	if (q) query = query.ilike('display_name', `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
	if (badges.some((b) => b.id === badge)) query = query.eq('badge', badge);

	const { data, count } = await query;
	return {
		total,
		runs,
		next,
		members: data ?? [],
		filters: { q, badge, sort },
		page,
		pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
		me: user.id
	};
};
