/**
 * Which site this app is. Stored on the profile at sign-up (profiles.signup_site).
 * SCC is the lead site: every site signs in with the one SCC account (shared Supabase project).
 */
export const SITE = 'scc' as const;

/** Only follow same-site relative paths after sign-in (no open redirects). */
export function safeNext(next: string | null, fallback = '/account') {
	return next?.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
