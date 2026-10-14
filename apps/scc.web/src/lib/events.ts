import type { Database } from 'database/types';
import type { TicketEvent } from '#lib/landing.js';
import { formatMoney } from '#lib/money.js';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type TicketTypeRow = Database['public']['Tables']['ticket_types']['Row'];
export type EventCategory = Database['public']['Enums']['event_category'];

export const categories: Record<EventCategory, { label: string; image: string }> = {
	cupping: { label: 'Cupping', image: '/img/event-tasting-ten.webp' },
	throwdown: { label: 'Throwdown', image: '/img/event-throwdown.webp' },
	festival: { label: 'Festival', image: '/img/event-festival-nyc.webp' },
	workshop: { label: 'Workshop', image: '/img/guide-roast.webp' },
	competition: { label: 'Competition', image: '/img/event-barista-league.webp' },
	meetup: { label: 'Meetup', image: '/img/hero-polaroid-throwdown.webp' },
	class: { label: 'Class', image: '/img/guide-roast.webp' },
	other: { label: 'Other', image: '/img/event-seoul.webp' }
};

export const categoryIds = Object.keys(categories) as EventCategory[];

export const isCategory = (value: string): value is EventCategory => value in categories;

export const coverImage = (event: Pick<EventRow, 'cover_image_url' | 'category'>) =>
	event.cover_image_url || categories[event.category].image;

export function slugify(text: string, max = 60) {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, max)
		.replace(/-+$/, '');
}

/** Short random suffix that keeps slugs unique without a lookup ("…-k3x9"). */
export const slugSuffix = () => Math.random().toString(36).slice(2, 6);

// Time zones ---------------------------------------------------------------------------------------

export const timeZones: string[] =
	typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC'];

export const isTimeZone = (tz: string) => {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: tz });
		return true;
	} catch {
		return false;
	}
};

/** Offset of `timeZone` from UTC at `date`, in ms. */
function zoneOffset(date: Date, timeZone: string) {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone,
			hourCycle: 'h23',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})
			.formatToParts(date)
			.map((p) => [p.type, p.value])
	);
	const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
	return asUtc - date.getTime();
}

/** "2026-10-16T18:30" wall-clock time in `timeZone` → UTC Date. Null if the input is not a datetime. */
export function zonedToUtc(local: string, timeZone: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
	if (!match) return null;
	const [, y, mo, d, h, mi] = match.map(Number);
	const guess = Date.UTC(y, mo - 1, d, h, mi);
	// Two passes settle DST boundaries.
	let utc = guess - zoneOffset(new Date(guess), timeZone);
	utc = guess - zoneOffset(new Date(utc), timeZone);
	return new Date(utc);
}

/** UTC ISO string → "2026-10-16T18:30" in `timeZone`, for datetime-local inputs. */
export function utcToZonedInput(iso: string, timeZone: string) {
	const date = new Date(iso);
	return new Date(date.getTime() + zoneOffset(date, timeZone)).toISOString().slice(0, 16);
}

const fmt = (iso: string, timeZone: string, options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(new Date(iso));

/** "Fri, Oct 16 · 6:30 PM – 9:00 PM EDT" (or a date range for multi-day events). */
export function formatWhen(event: Pick<EventRow, 'starts_at' | 'ends_at' | 'timezone'>) {
	const tz = event.timezone;
	const day = (iso: string) => fmt(iso, tz, { weekday: 'short', month: 'short', day: 'numeric' });
	const time = (iso: string, zone = false) =>
		fmt(iso, tz, { hour: 'numeric', minute: '2-digit', ...(zone ? { timeZoneName: 'short' } : {}) });

	if (day(event.starts_at) === day(event.ends_at)) {
		return `${day(event.starts_at)} · ${time(event.starts_at)} – ${time(event.ends_at, true)}`;
	}
	const year = (iso: string) => fmt(iso, tz, { year: 'numeric' });
	const sameYear = year(event.starts_at) === year(event.ends_at);
	return `${day(event.starts_at)}${sameYear ? '' : `, ${year(event.starts_at)}`} – ${day(event.ends_at)}, ${year(event.ends_at)}`;
}

export function formatDateLong(iso: string, timeZone: string) {
	return fmt(iso, timeZone, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(iso: string, timeZone: string) {
	return fmt(iso, timeZone, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export const place = (event: Pick<EventRow, 'is_online' | 'city' | 'country' | 'venue_name'>) =>
	event.is_online ? 'Online' : [event.city, event.country].filter(Boolean).join(', ') || event.venue_name || 'TBA';

// Listing cards -------------------------------------------------------------------------------------

export type ListedEvent = Pick<
	EventRow,
	| 'id'
	| 'slug'
	| 'title'
	| 'summary'
	| 'category'
	| 'cover_image_url'
	| 'starts_at'
	| 'ends_at'
	| 'timezone'
	| 'is_online'
	| 'city'
	| 'country'
	| 'venue_name'
	| 'currency'
	| 'status'
> & {
	ticket_types: Pick<TicketTypeRow, 'price' | 'is_hidden'>[];
	going: number;
};

/** "Free", "$25", or "From $25" across the visible ticket types ("Soon" when none are on sale). */
export function priceLabel(prices: number[], currency: string) {
	if (prices.length === 0) return 'Soon';
	const min = Math.min(...prices);
	const max = Math.max(...prices);
	if (max === 0) return 'Free';
	return `${min === max ? '' : 'From '}${formatMoney(min, currency)}`;
}

/** Map a listed event onto the landing page's TicketCard shape. */
export function toTicketEvent(event: ListedEvent): TicketEvent {
	const tz = event.timezone;
	const prices = event.ticket_types.filter((t) => !t.is_hidden).map((t) => t.price);
	const price = priceLabel(prices, event.currency).toUpperCase();
	const tags = [categories[event.category].label];
	if (price === 'FREE') tags.push('Free');
	if (event.status === 'cancelled') tags.unshift('Cancelled');
	return {
		slug: event.slug,
		title: event.title,
		image: coverImage(event),
		day: fmt(event.starts_at, tz, { day: '2-digit' }),
		month: fmt(event.starts_at, tz, { month: 'short' }).toUpperCase(),
		weekday: fmt(event.starts_at, tz, { weekday: 'short', month: 'short', day: '2-digit' })
			.toUpperCase()
			.replace(',', ' ·'),
		location: place(event),
		going: event.going.toLocaleString('en-US'),
		tags,
		price
	};
}

/** Columns + embeds for listing queries; pair with `withGoing`. */
export const listingSelect =
	'id, slug, title, summary, category, cover_image_url, starts_at, ends_at, timezone, is_online, city, country, venue_name, currency, status, ticket_types(price, is_hidden)';

export const whenFilters = {
	today: 'Today',
	weekend: 'This weekend',
	week: 'Next 7 days',
	month: 'Next 30 days'
} as const;
