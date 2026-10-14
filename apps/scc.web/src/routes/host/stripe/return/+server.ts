import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Stripe sends hosts back here after onboarding. /host re-reads the account from Stripe on load,
// so there is nothing to do but go there.
export const GET: RequestHandler = () => redirect(303, '/host?stripe=returned');
