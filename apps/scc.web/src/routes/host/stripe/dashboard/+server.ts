import { redirect } from '@sveltejs/kit';
import { stripe, stripeOrigins } from '#lib/server/stripe.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';
import type { RequestHandler } from './$types';

/**
 * Opens the host's Stripe Express dashboard (payouts, bank details, tax forms). Linked with
 * target="_blank" so the site stays open in the original tab. Login links are single-use and
 * short-lived, so one is minted per click. Signed-out visitors never get here (hooks guard /host).
 */
export const GET: RequestHandler = async ({ locals: { user } }) => {
	const { data: host } = await supabaseAdmin.from('hosts').select('stripe_account_id').eq('user_id', user!.id).maybeSingle();
	if (!host?.stripe_account_id) redirect(303, '/host');

	let url: string;
	try {
		url = (await stripe().accounts.createLoginLink(host.stripe_account_id)).url;
	} catch (err) {
		console.error('Stripe login link failed', err);
		// Most likely onboarding isn't finished; the host dashboard shows what's left.
		redirect(303, '/host');
	}
	redirect(303, url, stripeOrigins);
};
