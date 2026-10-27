import { error, redirect } from '@sveltejs/kit';
import { readExperience } from 'profile';
import { type ListedEvent, listingSelect } from '#lib/events.js';
import { withGoing } from '#lib/server/events.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals: { supabase, user } }) => {
	// Profiles are visible to members only, like the directory.
	if (!user) redirect(303, `/auth?next=${encodeURIComponent(url.pathname)}`);

	const number = Number(params.number);
	if (!Number.isInteger(number) || number < 1) error(404, 'Member not found.');

	const { data: member } = await supabase
		.from('members')
		.select(
			'user_id, member_number, display_name, bio, avatar_icon, avatar_hue, created_at, badge, headline, location, roles, years_in_coffee, skills, experience, availability, website, instagram'
		)
		.eq('member_number', number)
		.maybeSingle();
	if (!member) error(404, 'Member not found.');

	// If they host events, show their upcoming ones.
	const { data: host } = await supabase.from('hosts').select('id, slug, name').eq('user_id', member.user_id!).maybeSingle();
	let events: ListedEvent[] = [];
	if (host) {
		const { data } = await supabase
			.from('events')
			.select(listingSelect)
			.eq('host_id', host.id)
			.eq('status', 'published')
			.gte('ends_at', new Date().toISOString())
			.order('starts_at')
			.limit(6);
		events = await withGoing(supabase, data ?? []);
	}

	return {
		member: { ...member, experience: readExperience(member.experience) },
		host,
		events,
		isMe: member.user_id === user.id
	};
};
