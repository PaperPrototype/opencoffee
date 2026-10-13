import { fail, redirect } from '@sveltejs/kit';
import { safeNext, SITE } from '#lib/auth.js';
import type { Actions } from './$types';

const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

export const actions: Actions = {
	signin: async ({ request, url, locals: { supabase } }) => {
		const form = await request.formData();
		const email = field(form, 'email');
		const password = String(form.get('password') ?? '');

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			const message =
				error.code === 'email_not_confirmed'
					? 'Confirm your email first — check your inbox for the link.'
					: 'Wrong email or password.';
			return fail(400, { mode: 'signin', email, message });
		}

		redirect(303, safeNext(url.searchParams.get('next')));
	},

	signup: async ({ request, url, locals: { supabase } }) => {
		const form = await request.formData();
		const email = field(form, 'email');
		const password = String(form.get('password') ?? '');
		const display_name = field(form, 'display_name');

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				// The email template links to this URL, so the user lands back on this site.
				emailRedirectTo: `${url.origin}/auth/confirm`,
				data: { signup_site: SITE, display_name }
			}
		});
		// Every site signs in with the one SCC (Specialty Coffee Community) account, so an existing
		// email should sign in instead. Depending on the project's email-enumeration protection, Supabase reports
		// that either as a `user_already_exists` error or as a user with no identities (and no email).
		const exists =
			error?.code === 'user_already_exists' || (!error && data.user?.identities?.length === 0);
		if (exists) {
			return fail(400, {
				mode: 'signin',
				email,
				message:
					'You already have a Specialty Coffee Community account with this email. Sign in with its password.'
			});
		}
		if (error) {
			return fail(400, { mode: 'signup', email, display_name, message: error.message });
		}

		return { sent: 'signup' as const, email };
	},

	forgot: async ({ request, url, locals: { supabase } }) => {
		const form = await request.formData();
		const email = field(form, 'email');

		await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${url.origin}/auth/confirm`
		});
		// Same answer whether or not the account exists, so this can't be used to probe emails.
		return { sent: 'reset' as const, email };
	}
};
