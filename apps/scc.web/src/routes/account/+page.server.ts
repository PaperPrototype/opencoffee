import { error } from '@sveltejs/kit';
import { readExperience } from 'profile';
import type { PageServerLoad } from './$types';

// hooks.server.ts redirects signed-out visitors away from /account, so `user` is set here.
// Profile edits happen in the Coffee CV flow at /welcome.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data: profile, error: err } = await supabase
		.from('profiles')
		.select(
			'display_name, headline, location, bio, avatar_icon, avatar_hue, roles, years_in_coffee, skills, experience, availability, website, instagram, onboarded_at, created_at, member_number'
		)
		.eq('user_id', user!.id)
		.single();
	if (err) error(500, 'Could not load your profile.');

	return { userId: user!.id, email: user!.email, profile: { ...profile, experience: readExperience(profile.experience) } };
};
