import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { Database } from 'database/types';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	// Lets the layout re-run (and pick up the new session) via invalidate('supabase:auth').
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch }
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch },
				cookies: { getAll: () => data.cookies }
			});

	// Safe on the client: the session was validated in hooks.server.ts before it got here.
	const {
		data: { session }
	} = await supabase.auth.getSession();

	return { session, supabase };
};
