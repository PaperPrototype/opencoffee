import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Reached from the reset email: /auth/confirm has already signed the user in with the recovery token.
export const load: PageServerLoad = async ({ locals: { session } }) => {
	if (!session) redirect(303, '/auth?mode=forgot');
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const confirm = String(form.get('confirm') ?? '');

		if (password !== confirm) return fail(400, { message: "Passwords don't match." });

		const { error } = await supabase.auth.updateUser({ password });
		if (error) return fail(400, { message: error.message });

		redirect(303, '/account?updated=password');
	}
};
