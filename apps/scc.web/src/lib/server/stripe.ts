import { error } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$app/env/private';

let client: Stripe | undefined;

/** The platform's Stripe client. Created on first use so the site runs without Stripe keys (free events still work). */
export function stripe() {
	if (!STRIPE_SECRET_KEY) error(503, 'Paid ticketing is not configured yet (STRIPE_SECRET_KEY is missing).');
	client ??= new Stripe(STRIPE_SECRET_KEY, { appInfo: { name: 'Specialty Coffee Community' } });
	return client;
}

export type { Stripe };

let platform: Promise<Stripe.Account> | undefined;

/** The platform's own Stripe account (country decides which hosts need cross-border setup). */
export function platformAccount() {
	platform ??= stripe()
		.accounts.retrieveCurrent()
		.catch((err) => {
			platform = undefined;
			throw err;
		});
	return platform;
}
