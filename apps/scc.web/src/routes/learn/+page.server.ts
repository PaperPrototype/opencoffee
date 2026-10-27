import { fail } from '@sveltejs/kit';
import { sendContactMessage } from '#lib/server/email.js';
import type { Actions } from './$types';

export const actions: Actions = {
	/** "Email me when it opens": lands in the founder's inbox until there's a mailing list. */
	updates: async ({ request, locals: { user } }) => {
		const form = await request.formData();
		if (form.get('company')) return { subscribed: true };
		const email = String(form.get('email') ?? user?.email ?? '').trim().slice(0, 254);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, { updatesError: 'Enter an email we can write to.', email });
		try {
			await sendContactMessage({ name: '', email, body: 'Please add me to the education updates list (Master of Actual Coffee, skills assessments, creator courses).' });
		} catch (err) {
			console.error('Education updates signup failed', err);
			return fail(500, { updatesError: 'That didn’t go through. Email hello@specialtycoffeecommunity.com instead.', email });
		}
		return { subscribed: true };
	}
};
