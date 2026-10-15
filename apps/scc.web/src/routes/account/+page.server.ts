import { error, fail } from '@sveltejs/kit';
import { avatarIcons } from 'avatars';
import type { Actions, PageServerLoad } from './$types';

const iconIds = new Set(avatarIcons.map((icon) => icon.id));

// hooks.server.ts redirects signed-out visitors away from /account, so `user` is set here.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data: profile, error: err } = await supabase
		.from('profiles')
		.select('display_name, bio, avatar_icon, avatar_hue, signup_site, created_at, member_number')
		.eq('user_id', user!.id)
		.single();
	if (err) error(500, 'Could not load your profile.');

	return { userId: user!.id, email: user!.email, profile };
};

export const actions: Actions = {
	profile: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Sign in again.' });

		const form = await request.formData();
		const display_name = String(form.get('display_name') ?? '').trim() || null;
		const bio = String(form.get('bio') ?? '').trim() || null;
		const avatar_icon = String(form.get('avatar_icon') ?? '');
		const avatar_hue = Number(form.get('avatar_hue'));

		if (!iconIds.has(avatar_icon) || !Number.isInteger(avatar_hue) || avatar_hue < 0 || avatar_hue > 359) {
			return fail(400, { message: 'Pick a picture and a color.' });
		}

		const { error: err } = await supabase
			.from('profiles')
			.update({ display_name, bio, avatar_icon, avatar_hue })
			.eq('user_id', user.id);
		if (err) return fail(400, { message: err.message });

		return { saved: true };
	}
};
