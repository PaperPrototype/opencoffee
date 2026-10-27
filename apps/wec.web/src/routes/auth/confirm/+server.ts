import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Landing point for the links in the confirmation and password-reset emails. */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;

	if (token_hash && type) {
		const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			if (type === 'recovery') redirect(303, '/auth/reset-password');
			// Fresh accounts go through onboarding before anything else.
			const { data: profile } = await supabase
				.from('profiles')
				.select('onboarded_at')
				.eq('user_id', data.user!.id)
				.maybeSingle();
			redirect(303, profile && !profile.onboarded_at ? '/welcome' : '/account');
		}
	}

	redirect(303, '/auth/error');
};
