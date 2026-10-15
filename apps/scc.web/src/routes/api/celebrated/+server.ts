import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** The member saw their badge celebration: don't show it again. */
export const POST: RequestHandler = async ({ locals: { supabase, user } }) => {
	if (!user) error(401, 'Sign in first.');
	const { error: err } = await supabase
		.from('profiles')
		.update({ badge_celebrated_at: new Date().toISOString() })
		.eq('user_id', user.id)
		.is('badge_celebrated_at', null);
	if (err) error(500, err.message);
	return json({ ok: true });
};
