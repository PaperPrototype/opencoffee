import type { SupabaseClient } from '@supabase/supabase-js';
import { error, redirect } from '@sveltejs/kit';
import type { Database } from 'database/types';
import type { ListedEvent } from '#lib/events.js';

type Client = SupabaseClient<Database>;

/** Attach attendee counts ("going") to listed events. */
export async function withGoing<T extends { id: string }>(supabase: Client, events: T[]) {
	if (events.length === 0) return [] as (T & { going: number })[];
	const { data } = await supabase
		.from('event_attendance')
		.select('event_id, going')
		.in('event_id', events.map((e) => e.id));
	const going = new Map((data ?? []).map((row) => [row.event_id, row.going ?? 0]));
	return events.map((e) => ({ ...e, going: going.get(e.id) ?? 0 }));
}

export type { ListedEvent };

/** Public host columns (the Stripe account id is not readable by clients). */
export const hostColumns =
	'id, user_id, slug, name, bio, website, stripe_transfers_enabled, stripe_payouts_enabled, stripe_details_submitted, created_at';

/** The signed-in member's host profile, or a redirect to /host to create one. */
export async function requireHost(supabase: Client, userId: string) {
	const { data: host } = await supabase.from('hosts').select(hostColumns).eq('user_id', userId).maybeSingle();
	if (!host) redirect(303, '/host');
	return host;
}

/** An event the signed-in member hosts (404 otherwise — RLS hides drafts, the host check hides the rest). */
export async function requireHostedEvent(supabase: Client, userId: string, eventId: string) {
	const host = await requireHost(supabase, userId);
	const { data: event } = await supabase
		.from('events')
		.select('*')
		.eq('id', eventId)
		.eq('host_id', host.id)
		.maybeSingle();
	if (!event) error(404, 'Event not found.');
	return { host, event };
}
