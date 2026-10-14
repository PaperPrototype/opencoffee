import { redirect } from '@sveltejs/kit';
import { stripe } from '#lib/server/stripe.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';
import type { RequestHandler } from './$types';

// Stripe sends hosts here when an onboarding link expired or was already used: mint a fresh one.
export const GET: RequestHandler = async ({ url, locals: { user } }) => {
	const { data: host } = await supabaseAdmin.from('hosts').select('stripe_account_id').eq('user_id', user!.id).maybeSingle();
	if (!host?.stripe_account_id) redirect(303, '/host');

	const link = await stripe().accountLinks.create({
		account: host.stripe_account_id,
		type: 'account_onboarding',
		refresh_url: `${url.origin}/host/stripe/refresh`,
		return_url: `${url.origin}/host/stripe/return`
	});
	redirect(303, link.url);
};
