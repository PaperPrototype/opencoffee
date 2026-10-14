import { createClient } from '@supabase/supabase-js';
import type { Database } from 'database/types';
import { SUPABASE_SECRET_KEY } from '$app/env/private';
import { PUBLIC_SUPABASE_URL } from '$app/env/public';

/**
 * Service-role client: bypasses RLS. Only for writes clients may not make themselves
 * (orders, tickets, Stripe state) — always scope queries to the signed-in user by hand.
 */
export const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
});
