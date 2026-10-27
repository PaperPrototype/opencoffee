import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import { type Handle, sequence } from '@sveltejs/kit/hooks';
import type { Database } from 'database/types';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet, headers) => {
					// SvelteKit requires an explicit path; '/' keeps the session visible app-wide.
					cookiesToSet.forEach(({ name, value, options }) =>
						event.cookies.set(name, value, { ...options, path: '/' })
					);
					// Keep responses that carry auth cookies out of shared caches.
					event.setHeaders(headers);
				}
			}
		}
	);

	/**
	 * getSession() only decodes the cookie, so a tampered JWT would pass.
	 * getUser() asks the auth server, which makes the returned session trustworthy.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	return resolve(event, {
		// Supabase needs these headers passed through to the client.
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const path = event.url.pathname;
	const isPrivate = ['/account', '/welcome'].some((p) => path === p || path.startsWith(`${p}/`));
	if (!session && isPrivate) {
		redirect(303, `/auth?next=${encodeURIComponent(path)}`);
	}
	if (session && path === '/auth') {
		redirect(303, '/account');
	}

	return resolve(event);
};

export const handle = sequence(supabase, authGuard);
