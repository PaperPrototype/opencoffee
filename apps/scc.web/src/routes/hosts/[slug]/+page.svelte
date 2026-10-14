<script lang="ts">
	import { Globe } from '@lucide/svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketCard from '#lib/components/TicketCard.svelte';
	import { toTicketEvent } from '#lib/events.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const since = $derived(new Date(data.host.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
</script>

<svelte:head>
	<title>{data.host.name} — Specialty Coffee Community</title>
	{#if data.host.bio}<meta name="description" content={data.host.bio.slice(0, 160)} />{/if}
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-[1200px] px-6 py-14 md:px-8">
	<div class="flex flex-col gap-6 sm:flex-row sm:items-center">
		<span class="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-espresso bg-secondary font-display text-3xl font-semibold shadow-zine-sm">
			{data.host.name.slice(0, 1).toUpperCase()}
		</span>
		<div class="min-w-0">
			<p class="eyebrow">Host · since {since}</p>
			<h1 class="display mt-1 text-[40px] leading-tight font-semibold tracking-[-0.02em]">{data.host.name}</h1>
			{#if data.host.website}
				<a href={data.host.website} target="_blank" rel="noopener noreferrer nofollow" class="link-zine mt-1 text-sm"><Globe class="size-4" /> {data.host.website.replace(/^https?:\/\//, '')}</a>
			{/if}
		</div>
	</div>
	{#if data.host.bio}<p class="mt-6 max-w-[68ch] whitespace-pre-line text-roast">{data.host.bio}</p>{/if}

	<h2 class="mt-14 text-2xl font-medium">Upcoming events</h2>
	{#if data.upcoming.length}
		<div class="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.upcoming as event (event.id)}<TicketCard event={toTicketEvent(event)} />{/each}
		</div>
	{:else}
		<p class="mt-3 text-roast">Nothing scheduled right now.</p>
	{/if}

	{#if data.past.length}
		<h2 class="mt-16 text-2xl font-medium">Past events</h2>
		<div class="mt-6 grid gap-5 opacity-80 sm:grid-cols-2">
			{#each data.past.slice(0, 8) as event (event.id)}<TicketCard event={toTicketEvent(event)} layout="row" />{/each}
		</div>
	{/if}
</main>

<SiteFooter />
