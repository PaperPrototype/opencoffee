import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from 'database/types';
import { isCategory, isTimeZone, zonedToUtc } from '#lib/events.js';
import { isCurrency, parseMoney } from '#lib/money.js';

type EventInsert = Database['public']['Tables']['events']['Insert'];
type TicketTypeInsert = Database['public']['Tables']['ticket_types']['Insert'];

const text = (form: FormData, name: string, max: number) => String(form.get(name) ?? '').trim().slice(0, max) || null;

/** Event details from the editor form. Returns `{ error }` with a readable message on bad input. */
export function parseEventForm(form: FormData) {
	const title = text(form, 'title', 140);
	if (!title || title.length < 3) return { error: 'Give the event a title (at least 3 characters).' };

	const timezone = String(form.get('timezone') ?? 'UTC');
	if (!isTimeZone(timezone)) return { error: 'Pick a valid time zone.' };

	const starts = zonedToUtc(String(form.get('starts_at') ?? ''), timezone);
	const ends = zonedToUtc(String(form.get('ends_at') ?? ''), timezone);
	if (!starts || !ends) return { error: 'Set when the event starts and ends.' };
	if (ends < starts) return { error: 'The event has to end after it starts.' };

	const category = String(form.get('category') ?? 'other');
	const currency = String(form.get('currency') ?? 'usd');
	if (!isCategory(category)) return { error: 'Pick a category.' };
	if (!isCurrency(currency)) return { error: 'Pick a currency.' };

	const isOnline = form.get('is_online') === 'on';
	const capacityRaw = String(form.get('capacity') ?? '').trim();
	const capacity = capacityRaw ? Number(capacityRaw) : null;
	if (capacity != null && (!Number.isInteger(capacity) || capacity < 1)) return { error: 'Capacity must be a whole number, or empty for no limit.' };

	const values = {
		title,
		summary: text(form, 'summary', 280),
		description: text(form, 'description', 20000),
		category,
		currency,
		timezone,
		starts_at: starts.toISOString(),
		ends_at: ends.toISOString(),
		is_online: isOnline,
		venue_name: isOnline ? null : text(form, 'venue_name', 140),
		address: isOnline ? null : text(form, 'address', 300),
		city: isOnline ? null : text(form, 'city', 100),
		country: isOnline ? null : text(form, 'country', 100),
		capacity,
		refund_policy: text(form, 'refund_policy', 1000)
	} satisfies Partial<EventInsert>;

	let onlineUrl = text(form, 'online_url', 500);
	if (onlineUrl && !/^https?:\/\//.test(onlineUrl)) onlineUrl = `https://${onlineUrl}`;
	if (onlineUrl && !URL.canParse(onlineUrl)) return { error: 'The online link is not a valid URL.' };
	const secret = { online_url: isOnline ? onlineUrl : null, attendee_info: text(form, 'attendee_info', 2000) };

	return { values, secret };
}

/** A ticket type from the editor form, in the event's currency and time zone. */
export function parseTicketForm(form: FormData, event: { currency: string; timezone: string }) {
	const name = text(form, 'name', 80);
	if (!name) return { error: 'Name the ticket (e.g. "General admission").' };

	const price = parseMoney(String(form.get('price') ?? ''), event.currency);
	if (price == null) return { error: 'Enter a valid price, or 0 for free.' };
	// Stripe won't charge less than about US$0.50 (¥50, ₩700).
	const minimum = ({ krw: 700 } as Record<string, number>)[event.currency] ?? 50;
	if (price > 0 && price < minimum) {
		return { error: 'Paid tickets must cost at least the Stripe minimum (about US$0.50).' };
	}

	const qtyRaw = String(form.get('quantity') ?? '').trim();
	const quantity = qtyRaw ? Number(qtyRaw) : null;
	if (quantity != null && (!Number.isInteger(quantity) || quantity < 0)) return { error: 'Quantity must be a whole number, or empty for unlimited.' };

	const maxPerOrder = Number(form.get('max_per_order') || 10);
	if (!Number.isInteger(maxPerOrder) || maxPerOrder < 1 || maxPerOrder > 50) return { error: 'Max per order must be between 1 and 50.' };

	const when = (field: string) => {
		const raw = String(form.get(field) ?? '');
		return raw ? (zonedToUtc(raw, event.timezone)?.toISOString() ?? null) : null;
	};

	const values = {
		name,
		description: text(form, 'description', 500),
		price,
		quantity,
		max_per_order: maxPerOrder,
		sales_start: when('sales_start'),
		sales_end: when('sales_end'),
		is_hidden: form.get('is_hidden') === 'on'
	} satisfies Partial<TicketTypeInsert>;
	return { values };
}

const coverTypes: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/**
 * Upload a cover image (if the form has one) to the member's folder in the event-covers bucket.
 * Returns the public URL, null when no file was chosen, or `{ error }`.
 */
export async function uploadCover(supabase: SupabaseClient<Database>, userId: string, form: FormData) {
	const file = form.get('cover');
	if (!(file instanceof File) || file.size === 0) return { url: null };
	const ext = coverTypes[file.type];
	if (!ext) return { error: 'Cover images must be JPG, PNG or WebP.' };
	if (file.size > 5 * 1024 * 1024) return { error: 'Cover images can be at most 5 MB.' };

	const path = `${userId}/${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from('event-covers').upload(path, file, { contentType: file.type });
	if (error) return { error: `Could not upload the cover: ${error.message}` };
	return { url: supabase.storage.from('event-covers').getPublicUrl(path).data.publicUrl };
}
