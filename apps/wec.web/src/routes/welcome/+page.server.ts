import { error, fail, redirect } from '@sveltejs/kit';
import { avatarIcons } from 'avatars';
import { parseCoffeeCv, readExperience } from 'profile';
import { safeNext } from '#lib/auth.js';
import type { Actions, PageServerLoad } from './$types';

const iconIds = new Set(avatarIcons.map((icon) => icon.id));

const profileSelect =
	'member_number, display_name, headline, location, bio, avatar_icon, avatar_hue, roles, years_in_coffee, skills, experience, availability, interests, website, instagram, onboarded_at, created_at';

// hooks.server.ts redirects signed-out visitors away from /welcome, so `user` is set here.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data: profile, error: err } = await supabase
		.from('profiles')
		.select(profileSelect)
		.eq('user_id', user!.id)
		.single();
	if (err) error(500, 'Could not load your profile.');

	return { userId: user!.id, profile: { ...profile, experience: readExperience(profile.experience) } };
};

/** First finish (or skip) stamps onboarded_at; later edits leave it alone. */
const markOnboarded = (supabase: App.Locals['supabase'], userId: string) =>
	supabase.from('profiles').update({ onboarded_at: new Date().toISOString() }).eq('user_id', userId).is('onboarded_at', null);

export const actions: Actions = {
	save: async ({ request, url, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Sign in again.' });

		const form = await request.formData();
		const avatar_icon = String(form.get('avatar_icon') ?? '');
		const avatar_hue = Number(form.get('avatar_hue'));
		if (!iconIds.has(avatar_icon) || !Number.isInteger(avatar_hue) || avatar_hue < 0 || avatar_hue > 359) {
			return fail(400, { message: 'Pick a picture and a color.' });
		}

		const parsed = parseCoffeeCv(form);
		if ('message' in parsed) return fail(400, { message: parsed.message });
		if (!parsed.cv.display_name) return fail(400, { message: 'Add your name so people know who you are.' });

		const { error: err } = await supabase
			.from('profiles')
			.update({ ...parsed.cv, avatar_icon, avatar_hue })
			.eq('user_id', user.id);
		if (err) return fail(400, { message: err.message });
		await markOnboarded(supabase, user.id);

		const next = url.searchParams.get('next');
		redirect(303, next ? safeNext(next) : '/account?saved=cv');
	},

	skip: async ({ url, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Sign in again.' });
		await markOnboarded(supabase, user.id);
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
