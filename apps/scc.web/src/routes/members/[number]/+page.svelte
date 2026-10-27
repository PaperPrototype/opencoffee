<script lang="ts">
	import { ArrowRight, CalendarDays, Check, Pencil } from '@lucide/svelte';
	import { page } from '$app/state';
	import { badgeById, formatMemberNumber } from '#lib/badges.js';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import MemberBadge from '#lib/components/MemberBadge.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketCard from '#lib/components/TicketCard.svelte';
	import { toTicketEvent } from '#lib/events.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const m = $derived(data.member);
	const number = $derived(formatMemberNumber(m.member_number!));
	const name = $derived(m.display_name || `Member ${number}`);
	const badge = $derived(badgeById(m.badge));
	const since = $derived(new Date(m.created_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
</script>

<svelte:head>
	<title>{name} — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-[1100px] px-6 py-14">
	<a href="/members" class="font-mono text-xs tracking-[0.12em] text-crema uppercase hover:text-primary">← All members</a>

	{#if data.isMe && page.url.searchParams.has('saved')}
		<div role="status" class="mt-6 flex items-center gap-2 rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
			<Check class="size-4" /> Your Coffee CV is saved. This is how other members see it.
		</div>
	{/if}

	<section class="mt-6 grid items-start gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
		<CoffeeCv
			userId={m.user_id!}
			memberNumber={m.member_number!}
			name={m.display_name}
			headline={m.headline}
			location={m.location}
			avatarIcon={m.avatar_icon}
			avatarHue={m.avatar_hue}
			bio={m.bio}
			roles={m.roles ?? []}
			yearsInCoffee={m.years_in_coffee}
			skills={m.skills ?? []}
			experience={m.experience}
			availability={m.availability}
			website={m.website}
			instagram={m.instagram}
			strip={['Public Coffee CV', `Joined ${since}`]}
		/>
		<aside class="grid gap-5">
			{#if badge}
				<div class="grid justify-items-center gap-4 card-zine p-5 text-center">
					<MemberBadge badge={badge.id} size="medal" number={m.member_number!} class="w-full max-w-72" />
					<p class="text-sm text-roast">{name} is {badge.blurb} of Specialty Coffee Community.</p>
				</div>
			{/if}
			{#if data.isMe}
				<a href="/welcome" class="btn btn-primary btn-zine"><Pencil class="size-4" /> Edit your Coffee CV</a>
			{/if}
		</aside>
	</section>

	{#if data.host}
		<section class="mt-12">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<h2 class="flex items-center gap-2 text-2xl font-medium"><CalendarDays class="size-6 text-primary" /> Hosting</h2>
				<a href="/hosts/{data.host.slug}" class="link-zine text-sm">{data.host.name} <ArrowRight class="size-4" /></a>
			</div>
			{#if data.events.length}
				<div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.events as event (event.id)}<TicketCard event={toTicketEvent(event)} />{/each}
				</div>
			{:else}
				<p class="mt-3 text-roast">No upcoming events right now.</p>
			{/if}
		</section>
	{/if}
</main>

<SiteFooter />
