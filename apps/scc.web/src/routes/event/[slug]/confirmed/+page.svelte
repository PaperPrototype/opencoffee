<script lang="ts">
	import { ArrowRight, Check, Clock } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketPass from '#lib/components/TicketPass.svelte';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const event = $derived(data.order.events!);
	const done = $derived(data.order.status === 'completed');

	// Still waiting on Stripe: poll a few times until the webhook lands.
	onMount(() => {
		let tries = 0;
		const timer = setInterval(() => {
			if (done || ++tries > 10) return clearInterval(timer);
			invalidateAll();
		}, 2000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>{done ? "You're going" : 'Confirming'} — {event.title}</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-2xl px-6 py-16">
	{#if done}
		<span class="flex size-14 items-center justify-center rounded-full border-2 border-espresso bg-accent text-accent-content shadow-zine-sm">
			<Check class="size-7" />
		</span>
		<p class="eyebrow mt-6">{data.order.total > 0 ? `Paid ${formatMoney(data.order.total, data.order.currency)}` : 'Registered'}</p>
		<h1 class="display mt-2 text-[44px] leading-tight font-semibold tracking-[-0.02em]">You're going.</h1>
		<p class="mt-3 text-roast">
			We emailed your tickets too. Show the code below at the door — your tickets are always in
			<a href="/account/tickets" class="link-zine">your account</a>.
		</p>

		<div class="mt-10 space-y-5">
			{#each data.tickets as ticket (ticket.code)}
				<TicketPass {ticket} {event} secret={data.secret} />
			{/each}
		</div>
	{:else if data.order.status === 'pending'}
		<span class="flex size-14 items-center justify-center rounded-full border-2 border-espresso bg-secondary shadow-zine-sm">
			<Clock class="size-7" />
		</span>
		<h1 class="display mt-6 text-[40px] leading-tight font-semibold tracking-[-0.02em]">Confirming your payment…</h1>
		<p class="mt-3 text-roast">This usually takes a few seconds. You can leave this page — your tickets will appear in your account.</p>
	{:else}
		<h1 class="display text-[40px] leading-tight font-semibold tracking-[-0.02em]">This order is {data.order.status}.</h1>
		<p class="mt-3 text-roast">No tickets were issued. You can try again from the event page.</p>
	{/if}

	<a href="/event/{event.slug}" class="link-zine mt-10">Back to the event <ArrowRight class="size-4" /></a>
</main>
