<script lang="ts">
	import { ArrowRight, CalendarDays, MapPin, Search, X } from '@lucide/svelte';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketCard from '#lib/components/TicketCard.svelte';
	import { categories, categoryIds, toTicketEvent, whenFilters } from '#lib/events.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const cards = $derived(data.events.map(toTicketEvent));
	const filtered = $derived(Object.values(data.filters).some(Boolean));

	/** Link to the current search with one filter toggled (or cleared). */
	function withFilter(key: string, value: string) {
		const params = new URLSearchParams(page.url.searchParams.toString());
		if (!value || params.get(key) === value) params.delete(key);
		else params.set(key, value);
		const qs = params.toString();
		return qs ? `/events?${qs}` : '/events';
	}

	const active = (key: keyof typeof data.filters, value: string) => data.filters[key] === value;
	const chip = 'chip px-3.5 py-1.5 transition-colors hover:bg-espresso hover:text-paper';
</script>

<svelte:head>
	<title>Coffee events — Specialty Coffee Community</title>
	<meta
		name="description"
		content="Cuppings, throwdowns, festivals, workshops and meetups. Free to browse, free to list, free events stay free."
	/>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main>
	<section class="border-b-2 border-espresso">
		<div class="mx-auto max-w-[1344px] px-6 pt-14 pb-10 md:px-8">
			<p class="eyebrow">Events</p>
			<h1 class="display mt-4 max-w-[18ch] text-[44px] leading-[1.08] font-semibold tracking-[-0.025em] md:text-[64px]">
				Every coffee event, <span class="squiggle inline-block text-primary italic">one calendar.</span>
			</h1>
			<p class="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-roast">
				Throwdowns, cuppings, festivals and workshops hosted by the community. Prices are all-in — no
				checkout fees, and free events stay free.
			</p>

			<form method="GET" class="mt-8 flex max-w-[860px] flex-col card-zine shadow-zine sm:flex-row sm:items-center">
				{#each ['category', 'when', 'price'] as key (key)}
					{#if data.filters[key as keyof typeof data.filters]}
						<input type="hidden" name={key} value={data.filters[key as keyof typeof data.filters]} />
					{/if}
				{/each}
				<label class="flex flex-1 items-center">
					<span class="sr-only">Search events</span>
					<Search class="ml-5 size-4 shrink-0 text-crema" />
					<input
						type="search"
						name="q"
						defaultValue={data.filters.q}
						placeholder="Search events… try 'cupping'"
						class="input h-12 w-full border-0 bg-transparent px-3 text-[15px] placeholder:text-crema focus:outline-none"
					/>
				</label>
				<div class="my-3 hidden w-0.5 self-stretch bg-line sm:block"></div>
				<label class="flex items-center sm:w-[220px]">
					<span class="sr-only">City or country</span>
					<MapPin class="ml-5 size-4 shrink-0 text-primary" />
					<input
						name="city"
						defaultValue={data.filters.city}
						placeholder="City or country"
						class="input h-12 w-full border-0 bg-transparent px-3 font-mono text-[13px] placeholder:text-crema focus:outline-none"
					/>
				</label>
				<button type="submit" class="btn m-3 h-12 btn-primary btn-zine px-[26px] text-[15px] sm:m-2">Find events</button>
			</form>

			<div class="mt-6 flex flex-wrap items-center gap-2">
				{#each Object.entries(whenFilters) as [value, label] (value)}
					<a href={withFilter('when', value)} class="{chip} {active('when', value) ? 'bg-espresso text-paper' : 'bg-base-100'}">{label}</a>
				{/each}
				<span class="mx-1 h-5 w-0.5 bg-line" aria-hidden="true"></span>
				<a href={withFilter('price', 'free')} class="{chip} {active('price', 'free') ? 'bg-accent text-accent-content' : 'bg-base-100'}">Free</a>
				<a href={withFilter('price', 'paid')} class="{chip} {active('price', 'paid') ? 'bg-espresso text-paper' : 'bg-base-100'}">Paid</a>
			</div>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each categoryIds as id (id)}
					<a href={withFilter('category', id)} class="{chip} {active('category', id) ? 'bg-primary text-primary-content' : 'bg-base-200'}">
						{categories[id].label}
					</a>
				{/each}
			</div>
		</div>
	</section>

	<section class="bg-base-300 py-14">
		<div class="mx-auto max-w-[1344px] px-6 md:px-8">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<p class="flex items-center gap-2 font-mono text-[13px] text-crema uppercase">
					<CalendarDays class="size-4 text-primary" />
					{cards.length} upcoming {cards.length === 1 ? 'event' : 'events'}
				</p>
				{#if filtered}
					<a href="/events" class="link-zine text-sm"><X class="size-4" /> Clear filters</a>
				{/if}
			</div>

			{#if cards.length}
				<div class="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each cards as event (event.slug)}
						<TicketCard {event} />
					{/each}
				</div>
			{:else}
				<div class="mt-8 card-zine p-10 text-center">
					<h2 class="text-2xl font-medium">Nothing on the calendar{filtered ? ' for that search' : ' yet'}.</h2>
					<p class="mx-auto mt-2 max-w-[44ch] text-roast">
						Know a cupping or throwdown that's missing? Hosts list events here for free.
					</p>
					<div class="mt-6 flex flex-wrap justify-center gap-3">
						{#if filtered}<a href="/events" class="btn btn-zine bg-base-100">See all events</a>{/if}
						<a href="/host" class="btn btn-primary btn-zine">Host an event</a>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<section class="bg-neutral text-neutral-content">
		<div class="mx-auto flex max-w-[1100px] flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="eyebrow text-secondary">For hosts</p>
				<h2 class="display mt-3 text-[32px] leading-tight font-semibold tracking-[-0.02em] md:text-[40px]">
					Running a coffee event? <span class="text-primary italic">List it here.</span>
				</h2>
				<p class="mt-3 max-w-[56ch] text-neutral-content/80">
					Free to list. Free events stay free. Paid tickets carry one small all-in fee, and the money goes
					straight to your Stripe account.
				</p>
			</div>
			<a href="/host" class="btn shrink-0 btn-primary text-[15px]">Host an event <ArrowRight class="size-4" /></a>
		</div>
	</section>
</main>

<SiteFooter />
