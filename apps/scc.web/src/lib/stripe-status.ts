/**
 * Where a host's Stripe account stands, derived from the account itself (not from the onboarding
 * redirect: Stripe sends hosts back to return_url whenever they leave, finished or not).
 *
 * - none        no Stripe account yet
 * - incomplete  account exists but Stripe still needs details (onboarding was left part-way)
 * - reviewing   everything submitted; Stripe is verifying it
 * - active      ticket money can be transferred to the host
 */
export type StripeStatus = {
	state: 'none' | 'incomplete' | 'reviewing' | 'active';
	/** Human-readable things Stripe still needs (now, or soon for an active account). */
	missing: string[];
	/** For an active account: a date by which more info is due, else null. */
	dueBy: string | null;
	payoutsEnabled: boolean;
};

type AccountLike = {
	capabilities?: { transfers?: string } | null;
	payouts_enabled?: boolean | null;
	requirements?: {
		currently_due?: string[] | null;
		eventually_due?: string[] | null;
		past_due?: string[] | null;
		current_deadline?: number | null;
	} | null;
};

/** Friendly names for Stripe requirement keys (prefix match); anything else is humanized. */
const labels: [prefix: string, label: string][] = [
	['external_account', 'a bank account for payouts'],
	['business_type', 'your business type'],
	['identity.entity_type', 'your business type'],
	['tos_acceptance', "acceptance of Stripe's terms"],
	['identity.attestations', "acceptance of Stripe's terms"],
	['individual.verification', 'a photo ID'],
	['identity.individual.documents', 'a photo ID'],
	['individual.id_number', 'your ID number'],
	['individual.address', 'your address'],
	['individual.dob', 'your date of birth'],
	['individual', 'your personal details'],
	['identity.individual', 'your personal details'],
	['company', 'your business details'],
	['identity.business_details', 'your business details'],
	['business_profile', 'your business profile'],
	['representative', 'details of the account representative'],
	['owners', "details of the business's owners"],
	['directors', "details of the business's directors"]
];

function label(key: string) {
	const hit = labels.find(([prefix]) => key === prefix || key.startsWith(`${prefix}.`) || key.startsWith(prefix));
	return hit ? hit[1] : key.split('.').pop()!.replaceAll('_', ' ');
}

export function stripeStatus(account: AccountLike | null): StripeStatus {
	if (!account) return { state: 'none', missing: [], dueBy: null, payoutsEnabled: false };

	const r = account.requirements;
	const active = account.capabilities?.transfers === 'active';
	// A fresh v2 account lists everything under eventually_due (currently_due stays empty), so until
	// the account is active, anything outstanding means onboarding isn't finished.
	const due = [...(r?.past_due ?? []), ...(r?.currently_due ?? []), ...(active ? [] : (r?.eventually_due ?? []))];
	const missing = [...new Set(due.map(label))];
	const deadline = r?.current_deadline;
	const base = { missing, payoutsEnabled: account.payouts_enabled ?? false, dueBy: deadline ? new Date(deadline * 1000).toISOString() : null };

	if (active) return { state: 'active', ...base };
	if (missing.length) return { state: 'incomplete', ...base };
	// Nothing left to provide: Stripe is verifying what was submitted.
	return { state: 'reviewing', ...base };
}
