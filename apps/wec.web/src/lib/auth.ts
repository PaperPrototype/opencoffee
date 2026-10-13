/**
 * Which site this app is. Stored on the profile at sign-up (profiles.signup_site).
 * WEC has no accounts of its own: people sign in with their SCC (Specialty Coffee Community)
 * account, which lives in the same Supabase project.
 */
export const SITE = 'wec' as const;

/** Only follow same-site relative paths after sign-in (no open redirects). */
export function safeNext(next: string | null, fallback = '/account') {
	return next?.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
