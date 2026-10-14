import { fail, isHttpError, redirect } from '@sveltejs/kit';
import { slugify, slugSuffix } from '#lib/events.js';
import { hostColumns } from '#lib/server/events.js';
import { syncStripeAccount } from '#lib/server/orders.js';
import { platformAccount, stripe } from '#lib/server/stripe.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';
import { payoutCountries } from '#lib/stripe-countries.js';
import type { Actions, PageServerLoad } from './$types';

// hooks.server.ts redirects signed-out visitors away from /host, so `user` is set here.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data: host } = await supabase.from('hosts').select(hostColumns).eq('user_id', user!.id).maybeSingle();
	if (!host) {
		const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', user!.id).single();
		return { host: null, events: [], balance: [], platformCountry: 'US', suggestedName: profile?.display_name ?? '' };
	}

	const { data: secret } = await supabaseAdmin.from('hosts').select('stripe_account_id').eq('id', host.id).single();
	const accountId = secret?.stripe_account_id;

	// Onboarding finishes on Stripe's side; refresh our copy until payments are switched on.
	if (accountId && !host.stripe_transfers_enabled) {
		try {
			const account = await stripe().accounts.retrieve(accountId);
			await syncStripeAccount(account);
			host.stripe_transfers_enabled = account.capabilities?.transfers === 'active';
			host.stripe_payouts_enabled = account.payouts_enabled ?? false;
			host.stripe_details_submitted = account.details_submitted ?? false;
		} catch (err) {
			console.error('Stripe account sync failed', err);
		}
	}

	// The host's Stripe balance, per currency: what's on its way and what can be paid out instantly.
	let balance: { currency: string; available: number; pending: number; instant: number }[] = [];
	if (accountId && host.stripe_transfers_enabled) {
		try {
			const b = await stripe().balance.retrieve({}, { stripeAccount: accountId });
			const currencies = new Set([...b.available, ...b.pending].map((x) => x.currency));
			const sum = (list: { currency: string; amount: number }[] | undefined, c: string) =>
				(list ?? []).filter((x) => x.currency === c).reduce((t, x) => t + x.amount, 0);
			balance = [...currencies].map((c) => ({
				currency: c,
				available: sum(b.available, c),
				pending: sum(b.pending, c),
				instant: sum(b.instant_available, c)
			}));
		} catch (err) {
			console.error('Stripe balance failed', err);
		}
	}

	const { data: events } = await supabase
		.from('events')
		.select('id, slug, title, status, starts_at, ends_at, timezone, currency, category, cover_image_url')
		.eq('host_id', host.id)
		.order('starts_at', { ascending: false });

	const ids = (events ?? []).map((e) => e.id);
	const { data: orders } = ids.length
		? await supabase.from('orders').select('event_id, total, platform_fee').in('event_id', ids).eq('status', 'completed')
		: { data: [] };
	const { data: attendance } = ids.length
		? await supabase.from('event_attendance').select('event_id, going').in('event_id', ids)
		: { data: [] };

	const stats = new Map<string, { gross: number; fees: number; going: number }>();
	for (const id of ids) stats.set(id, { gross: 0, fees: 0, going: 0 });
	for (const o of orders ?? []) {
		const s = stats.get(o.event_id)!;
		s.gross += o.total;
		s.fees += o.platform_fee;
	}
	for (const a of attendance ?? []) if (a.event_id) stats.get(a.event_id)!.going = a.going ?? 0;

	let platformCountry = 'US';
	try {
		platformCountry = (await platformAccount()).country ?? 'US';
	} catch {
		// Stripe not configured yet; the default is fine.
	}

	return {
		host,
		balance,
		platformCountry,
		events: (events ?? []).map((e) => ({ ...e, ...stats.get(e.id)! })),
		suggestedName: ''
	};
};

const text = (form: FormData, name: string, max: number) => String(form.get(name) ?? '').trim().slice(0, max) || null;

/** "mycafe.com" → "https://mycafe.com"; anything that still isn't an http(s) URL is dropped. */
function normalizeUrl(value: string | null) {
	if (!value) return null;
	const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	return URL.canParse(url) ? url : null;
}

export const actions: Actions = {
	/** Become a host: create the organizer profile. */
	create: async ({ request, locals: { supabase, user } }) => {
		const form = await request.formData();
		const name = text(form, 'name', 80);
		if (!name) return fail(400, { message: 'Give your host profile a name.' });

		const base = slugify(name, 50) || 'host';
		const { error } = await supabase.from('hosts').insert({
			user_id: user!.id,
			name,
			slug: `${base}-${slugSuffix()}`,
			bio: text(form, 'bio', 2000),
			website: normalizeUrl(text(form, 'website', 300))
		});
		if (error) return fail(400, { message: error.code === '23505' ? 'You already have a host profile.' : error.message });
		return { created: true };
	},

	profile: async ({ request, locals: { supabase, user } }) => {
		const form = await request.formData();
		const name = text(form, 'name', 80);
		if (!name) return fail(400, { message: 'Your host profile needs a name.' });
		const website = normalizeUrl(text(form, 'website', 300));

		const { error } = await supabase
			.from('hosts')
			.update({ name, bio: text(form, 'bio', 2000), website })
			.eq('user_id', user!.id);
		if (error) return fail(400, { message: error.message });
		return { saved: true };
	},

	/** Start (or resume) Stripe Connect onboarding so the host can sell paid tickets. */
	connect: async ({ request, url, locals: { supabase, user } }) => {
		const { data: host } = await supabase.from('hosts').select('id, name, website').eq('user_id', user!.id).single();
		if (!host) return fail(400, { message: 'Create your host profile first.' });

		const form = await request.formData();
		const { data: existing } = await supabaseAdmin.from('hosts').select('stripe_account_id').eq('id', host.id).single();

		let accountId = existing?.stripe_account_id;
		let redirectTo: string;
		try {
			if (!accountId) {
				const country = String(form.get('country') ?? '');
				if (!payoutCountries.some((c) => c.code === country)) return fail(400, { message: 'Pick the country your bank account is in.' });

				// Ticket money reaches hosts as transfers (destination charges), so `transfers` is the only
				// capability they need. Hosts outside the platform's country can't take card payments
				// directly anyway; they sign Stripe's lighter "recipient" agreement (cross-border payouts).
				const crossBorder = country !== (await platformAccount()).country;
				const account = await stripe().accounts.create(
					{
						country,
						email: user!.email,
						// Express-style: Stripe hosts onboarding and a light dashboard; the platform pays
						// Stripe's processing fees out of its application fee and covers negative balances.
						controller: {
							stripe_dashboard: { type: 'express' },
							fees: { payer: 'application' },
							losses: { payments: 'application' }
						},
						capabilities: { transfers: { requested: true } },
						...(crossBorder ? { tos_acceptance: { service_agreement: 'recipient' as const } } : {}),
						business_profile: {
							name: host.name,
							product_description: 'Tickets to coffee events listed on Specialty Coffee Community',
							...(host.website ? { url: host.website } : {})
						},
						metadata: { host_id: host.id, user_id: user!.id }
					},
					{ idempotencyKey: `connect-account-${host.id}-${country}` }
				);
				accountId = account.id;
				await supabaseAdmin.from('hosts').update({ stripe_account_id: accountId }).eq('id', host.id);
			}

			const link = await stripe().accountLinks.create({
				account: accountId,
				type: 'account_onboarding',
				refresh_url: `${url.origin}/host/stripe/refresh`,
				return_url: `${url.origin}/host/stripe/return`
			});
			redirectTo = link.url;
		} catch (err) {
			if (isHttpError(err)) throw err;
			console.error('Stripe onboarding failed', err);
			const message = err instanceof Error ? err.message : 'Could not reach Stripe. Try again.';
			return fail(502, {
				message: /cross-border|recipient|not supported|country/i.test(message)
					? `Stripe can't pay out to hosts in that country from this platform yet (${message})`
					: message
			});
		}
		redirect(303, redirectTo);
	},

	/** Pay the host's instantly-available balance out to their debit card now (Stripe Instant Payouts). */
	payout: async ({ request, locals: { supabase, user } }) => {
		const { data: host } = await supabase.from('hosts').select('id').eq('user_id', user!.id).single();
		const { data: secret } = await supabaseAdmin.from('hosts').select('stripe_account_id').eq('id', host!.id).single();
		if (!secret?.stripe_account_id) return fail(400, { message: 'Connect Stripe first.' });
		const currency = String((await request.formData()).get('currency') ?? '');

		try {
			const balance = await stripe().balance.retrieve({}, { stripeAccount: secret.stripe_account_id });
			const amount = (balance.instant_available ?? []).filter((b) => b.currency === currency).reduce((t, b) => t + b.amount, 0);
			if (amount <= 0) return fail(400, { message: 'Nothing is available for an instant payout right now.' });
			await stripe().payouts.create(
				{ amount, currency, method: 'instant', statement_descriptor: 'SCC tickets' },
				{ stripeAccount: secret.stripe_account_id }
			);
		} catch (err) {
			console.error('Instant payout failed', err);
			// Most common: no eligible debit card on the account, or the account isn't eligible yet.
			return fail(400, { message: `Instant payout failed: ${err instanceof Error ? err.message : 'unknown error'}. Standard payouts still arrive on Stripe's normal schedule.` });
		}
		return { paidOut: currency };
	},

	/** Open the host's Stripe Express dashboard (payouts, bank details, tax forms). */
	dashboard: async ({ locals: { supabase, user } }) => {
		const { data: host } = await supabase.from('hosts').select('id').eq('user_id', user!.id).single();
		const { data: secret } = await supabaseAdmin.from('hosts').select('stripe_account_id').eq('id', host!.id).single();
		if (!secret?.stripe_account_id) return fail(400, { message: 'Connect Stripe first.' });
		const link = await stripe().accounts.createLoginLink(secret.stripe_account_id);
		redirect(303, link.url);
	}
};
