import nodemailer, { type Transporter } from 'nodemailer';
import QRCode from 'qrcode';
import { EMAIL_FROM, SMTP_URL } from '$app/env/private';
import { formatDateLong, formatWhen, place } from '#lib/events.js';
import { eventIcs } from '#lib/ics.js';
import { formatMoney } from '#lib/money.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';

let transport: Transporter | undefined;

type Mail = {
	to: string;
	subject: string;
	html: string;
	text: string;
	attachments?: { filename: string; content: Buffer | string; contentType: string; cid?: string }[];
};

/** Send one email. Without SMTP_URL the message is logged instead, so local dev never breaks. */
async function send(mail: Mail) {
	if (!SMTP_URL) {
		console.info(`[email skipped: SMTP_URL unset] to=${mail.to} subject="${mail.subject}"`);
		return;
	}
	transport ??= nodemailer.createTransport(SMTP_URL);
	await transport.sendMail({ from: EMAIL_FROM, ...mail });
}

// Layout ------------------------------------------------------------------------------------------

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Table-based, inline-styled wrapper in the site's paper/espresso/terracotta palette. */
function layout(body: string, preheader: string) {
	return `<!doctype html><html><body style="margin:0;background:#faf5ec;font-family:Helvetica,Arial,sans-serif;color:#241610">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ec;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:2px solid #241610;border-radius:14px">
<tr><td style="padding:28px 28px 8px;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c4572a">Specialty Coffee Community</td></tr>
<tr><td style="padding:0 28px 28px;font-size:16px;line-height:1.6">${body}</td></tr>
</table>
<p style="font-size:12px;color:#8c6a4f;margin-top:16px">Free to join. Free events stay free.</p>
</td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
	`<a href="${esc(href)}" style="display:inline-block;background:#c4572a;color:#faf5ec;text-decoration:none;font-weight:bold;padding:12px 22px;border:2px solid #241610;border-radius:999px">${esc(label)}</a>`;

// Data --------------------------------------------------------------------------------------------

async function loadOrder(orderId: string) {
	const { data: order, error } = await supabaseAdmin
		.from('orders')
		.select(
			'id, status, total, currency, buyer_name, buyer_email, events(id, slug, title, summary, starts_at, ends_at, timezone, is_online, venue_name, address, city, country, hosts(name)), tickets(code, status, ticket_types(name))'
		)
		.eq('id', orderId)
		.single();
	if (error || !order?.events) throw new Error(`Order ${orderId} not found for email: ${error?.message}`);
	return { ...order, event: order.events };
}

type Event = Awaited<ReturnType<typeof loadOrder>>['event'];

const where = (e: Event) =>
	e.is_online ? 'Online' : [e.venue_name, e.address, e.city, e.country].filter(Boolean).join(', ') || place(e);

// Emails ------------------------------------------------------------------------------------------

/**
 * Ticket confirmation with QR codes and a calendar invite. Sent once per order: the
 * confirmation_sent_at claim makes concurrent callers (webhook + return page) no-ops.
 */
export async function sendOrderConfirmation(orderId: string, origin: string) {
	const { data: claimed } = await supabaseAdmin
		.from('orders')
		.update({ confirmation_sent_at: new Date().toISOString() })
		.eq('id', orderId)
		.eq('status', 'completed')
		.is('confirmation_sent_at', null)
		.select('id');
	if (!claimed?.length) return;

	try {
		const order = await loadOrder(orderId);
		if (!order.buyer_email) return;
		const e = order.event;
		const { data: secret } = await supabaseAdmin.from('event_private').select('online_url, attendee_info').eq('event_id', e.id).maybeSingle();

		const tickets = order.tickets.filter((t) => t.status === 'valid');
		const qrs = await Promise.all(
			tickets.map((t) => QRCode.toBuffer(t.code, { margin: 1, width: 240, color: { dark: '#241610', light: '#fffdf8' } }))
		);
		const url = `${origin}/event/${e.slug}`;
		const paid = order.total > 0 ? `Paid ${formatMoney(order.total, order.currency)}. ` : '';

		const ticketRows = tickets
			.map(
				(t, i) => `<tr><td style="padding:12px 0;border-top:2px dashed #241610">
<img src="cid:qr-${i}" width="120" height="120" alt="QR code ${t.code}" style="float:right;border:2px solid #241610;border-radius:8px">
<div style="font-family:'Courier New',monospace;font-size:20px;font-weight:bold;letter-spacing:3px">${t.code}</div>
<div style="color:#8c6a4f;font-size:14px">${esc(t.ticket_types?.name ?? 'Ticket')}</div></td></tr>`
			)
			.join('');

		const extras = [
			secret?.online_url
				? `<p style="margin:16px 0 0"><strong>Join online:</strong> <a href="${esc(secret.online_url)}" style="color:#c4572a">${esc(secret.online_url)}</a></p>`
				: '',
			secret?.attendee_info
				? `<p style="margin:16px 0 0;padding:12px 14px;background:#f2e9da;border-radius:10px;white-space:pre-line"><strong>From ${esc(e.hosts?.name ?? 'the host')}:</strong><br>${esc(secret.attendee_info)}</p>`
				: ''
		].join('');

		await send({
			to: order.buyer_email,
			subject: `You're going: ${e.title}`,
			text: [
				`You're going to ${e.title}.`,
				`${formatWhen(e)}`,
				where(e),
				'',
				`${paid}${e.is_online ? 'Your ticket codes:' : 'Show these codes at the door:'}`,
				...tickets.map((t) => `  ${t.code}  (${t.ticket_types?.name ?? 'Ticket'})`),
				secret?.online_url ? `\nJoin online: ${secret.online_url}` : '',
				secret?.attendee_info ? `\nFrom the host:\n${secret.attendee_info}` : '',
				'',
				`Your tickets: ${origin}/account/tickets`,
				`Event page: ${url}`
			].join('\n'),
			html: layout(
				`<h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.15;margin:8px 0 12px">You're going.</h1>
<p style="margin:0"><strong>${esc(e.title)}</strong><br>${esc(formatDateLong(e.starts_at, e.timezone))} · ${esc(formatWhen(e))}<br>${esc(where(e))}</p>
${extras}
<p style="margin:20px 0 4px;color:#4a3226">${paid}${e.is_online ? 'Your ticket codes:' : 'Show a code below at the door — one per person.'}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${ticketRows}</table>
<p style="margin:24px 0 0">${button(`${origin}/account/tickets`, 'View your tickets')}</p>
<p style="font-size:13px;color:#8c6a4f;margin:20px 0 0">Hosted by ${esc(e.hosts?.name ?? 'a community member')}. <a href="${esc(url)}" style="color:#8c6a4f">Event page</a></p>`,
				`${tickets.length} ticket${tickets.length === 1 ? '' : 's'} for ${e.title}`
			),
			attachments: [
				...qrs.map((content, i) => ({ filename: `ticket-${tickets[i].code}.png`, content, contentType: 'image/png', cid: `qr-${i}` })),
				{
					filename: 'event.ics',
					contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
					content: eventIcs({ ...e, location: secret?.online_url ?? where(e), url })
				}
			]
		});
	} catch (err) {
		// Release the claim so a later call (webhook retry, page reload) can try again.
		await supabaseAdmin.from('orders').update({ confirmation_sent_at: null }).eq('id', orderId);
		console.error(`Confirmation email failed for order ${orderId}`, err);
	}
}

/** Tell a buyer their order was refunded/cancelled — by the host, or because the event was cancelled. */
export async function sendOrderVoided(orderId: string, origin: string, reason: 'host' | 'event_cancelled' | 'refund') {
	try {
		const order = await loadOrder(orderId);
		if (!order.buyer_email) return;
		const e = order.event;
		const money = order.total > 0 ? `${formatMoney(order.total, order.currency)} has been refunded to your original payment method — it usually shows up within 5–10 business days.` : '';
		const headline = reason === 'event_cancelled' ? `${e.title} has been cancelled` : `Your tickets for ${e.title} were ${order.total > 0 ? 'refunded' : 'cancelled'}`;
		const why =
			reason === 'event_cancelled'
				? `${e.hosts?.name ?? 'The host'} cancelled ${e.title} (${formatDateLong(e.starts_at, e.timezone)}).`
				: `${e.hosts?.name ?? 'The host'} ${order.total > 0 ? 'refunded' : 'cancelled'} your order for ${e.title}.`;

		await send({
			to: order.buyer_email,
			subject: headline,
			text: [why, money, 'Your tickets are no longer valid.', '', `Find another event: ${origin}/events`].filter(Boolean).join('\n'),
			html: layout(
				`<h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.2;margin:8px 0 12px">${esc(headline)}</h1>
<p style="margin:0">${esc(why)}</p>
${money ? `<p style="margin:12px 0 0">${esc(money)}</p>` : ''}
<p style="margin:12px 0 0;color:#4a3226">Your tickets (${order.tickets.map((t) => t.code).join(', ')}) are no longer valid.</p>
<p style="margin:24px 0 0">${button(`${origin}/events`, 'Find another event')}</p>`,
				why
			),
			attachments:
				reason === 'event_cancelled'
					? [{ filename: 'event.ics', contentType: 'text/calendar; charset=utf-8; method=CANCEL', content: eventIcs({ ...e, location: where(e), url: `${origin}/event/${e.slug}`, cancelled: true }) }]
					: []
		});
	} catch (err) {
		console.error(`Refund email failed for order ${orderId}`, err);
	}
}
