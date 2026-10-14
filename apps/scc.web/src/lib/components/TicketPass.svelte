<script lang="ts">
	import { CalendarDays, Link, MapPin } from '@lucide/svelte';
	import { formatWhen, place } from '#lib/events.js';

	let {
		ticket,
		event,
		secret = null
	}: {
		ticket: { code: string; status: string; checked_in_at: string | null; type: string; attendee: string | null; qr: string };
		/** Ticket-holder-only details (joining link, door info). */
		secret?: { online_url: string | null; attendee_info: string | null } | null;
		event: { title: string; slug: string; starts_at: string; ends_at: string; timezone: string; is_online: boolean; city: string | null; country: string | null; venue_name: string | null; status: string };
	} = $props();

	const void_ = $derived(ticket.status === 'void' || event.status === 'cancelled');
</script>

<article class="flex flex-col overflow-hidden card-zine sm:flex-row {void_ ? 'opacity-60' : ''}">
	<div class="flex min-w-0 flex-1 flex-col gap-2 p-5">
		<p class="eyebrow">{ticket.type}</p>
		<a href="/event/{event.slug}" class="text-xl leading-snug font-semibold hover:text-primary">{event.title}</a>
		<p class="flex items-center gap-1.5 font-mono text-xs text-crema"><CalendarDays class="size-3.5 text-primary" /> {formatWhen(event)}</p>
		<p class="flex items-center gap-1.5 font-mono text-xs text-crema"><MapPin class="size-3.5 text-primary" /> {event.venue_name ? `${event.venue_name} · ` : ''}{place(event)}</p>
		{#if secret?.online_url && !void_}
			<a href={secret.online_url} target="_blank" rel="noopener noreferrer" class="link-zine mt-1 text-sm"><Link class="size-3.5" /> Join online</a>
		{/if}
		{#if secret?.attendee_info && !void_}
			<p class="mt-1 rounded-[10px] bg-base-300 px-3 py-2 text-[13px] whitespace-pre-line text-roast">{secret.attendee_info}</p>
		{/if}
		{#if ticket.attendee}<p class="mt-auto pt-2 text-sm text-roast">{ticket.attendee}</p>{/if}
	</div>
	<div class="flex items-center gap-4 border-t-2 border-dashed border-espresso p-5 sm:flex-col sm:justify-center sm:border-t-0 sm:border-l-2">
		{#if void_}
			<span class="chip border-error text-error">{event.status === 'cancelled' ? 'Event cancelled' : 'Refunded'}</span>
		{:else}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- generated server-side from our own ticket code -->
			<div class="size-28 [&_svg]:size-full" aria-label="QR code for ticket {ticket.code}" role="img">{@html ticket.qr}</div>
		{/if}
		<div class="text-center">
			<p class="font-mono text-base font-semibold tracking-[0.12em]">{ticket.code}</p>
			{#if ticket.checked_in_at}<p class="font-mono text-[10px] text-accent uppercase">Checked in</p>{/if}
		</div>
	</div>
</article>
