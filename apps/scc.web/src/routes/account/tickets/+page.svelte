<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketPass from '#lib/components/TicketPass.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Your tickets — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-3xl px-6 py-16">
	<a href="/account" class="font-mono text-xs tracking-[0.12em] text-crema uppercase hover:text-primary">← Account</a>
	<p class="eyebrow mt-6">Your tickets</p>
	<h1 class="display mt-2 text-[44px] leading-tight font-semibold tracking-[-0.02em]">Where you're headed.</h1>

	{#if data.upcoming.length}
		<div class="mt-10 space-y-5">
			{#each data.upcoming as { ticket, event, secret } (ticket.code)}
				<TicketPass {ticket} {event} {secret} />
			{/each}
		</div>
	{:else}
		<div class="mt-10 card-zine p-8 text-center">
			<p class="text-lg font-medium">No upcoming tickets.</p>
			<a href="/events" class="link-zine mt-3">Find a coffee event <ArrowRight class="size-4" /></a>
		</div>
	{/if}

	{#if data.past.length}
		<h2 class="mt-16 text-2xl font-medium">Past events</h2>
		<div class="mt-6 space-y-5 opacity-80">
			{#each data.past as { ticket, event } (ticket.code)}
				<TicketPass {ticket} {event} />
			{/each}
		</div>
	{/if}
</main>
