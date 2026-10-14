/** Minimal iCalendar (RFC 5545) file for one event, for "Add to calendar" and email invites. */

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

/** Lines longer than 75 octets must be folded (continuation lines start with a space). */
function fold(line: string) {
	const out = [line.slice(0, 75)];
	// Continuation lines carry a leading space, so they hold 74 characters of content.
	for (let i = 75; i < line.length; i += 74) out.push(line.slice(i, i + 74));
	return out.join('\r\n ');
}

export function eventIcs(event: {
	id: string;
	title: string;
	summary: string | null;
	starts_at: string;
	ends_at: string;
	location: string;
	url: string;
	cancelled?: boolean;
}) {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Specialty Coffee Community//Events//EN',
		'CALSCALE:GREGORIAN',
		`METHOD:${event.cancelled ? 'CANCEL' : 'PUBLISH'}`,
		'BEGIN:VEVENT',
		`UID:${event.id}@specialtycoffeecommunity.com`,
		`DTSTAMP:${stamp(new Date().toISOString())}`,
		`DTSTART:${stamp(event.starts_at)}`,
		`DTEND:${stamp(event.ends_at)}`,
		`SUMMARY:${escape(event.title)}`,
		event.summary ? `DESCRIPTION:${escape(`${event.summary}\n\n${event.url}`)}` : `DESCRIPTION:${escape(event.url)}`,
		`LOCATION:${escape(event.location)}`,
		`URL:${event.url}`,
		`STATUS:${event.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return lines.map(fold).join('\r\n') + '\r\n';
}
