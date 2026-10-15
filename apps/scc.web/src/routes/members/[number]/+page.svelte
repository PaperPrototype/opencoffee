<script lang="ts">
	import { ArrowRight, CalendarDays, Pencil } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { badgeById, formatMemberNumber } from '#lib/badges.js';
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

	<section class="mt-6 flex flex-col gap-8 card-zine p-8 shadow-zine-lg md:flex-row md:items-center">
		<Avatar userId={m.user_id!} icon={m.avatar_icon} hue={m.avatar_hue} size={112} class="border-2 border-espresso shadow-zine-sm" />
		<div class="min-w-0 flex-1">
			<p class="eyebrow">Member {number}</p>
			<h1 class="display mt-1 text-[40px] leading-tight font-semibold tracking-[-0.02em] break-words">{name}</h1>
			<p class="mt-1 font-mono text-[13px] text-crema">Joined {since}</p>
			{#if m.bio}<p class="mt-4 max-w-[60ch] whitespace-pre-line text-roast">{m.bio}</p>{/if}
			{#if data.isMe}
				<a href="/account" class="link-zine mt-4 text-sm"><Pencil class="size-4" /> Edit your profile</a>
			{/if}
		</div>
		{#if badge}
			<div class="flex flex-col items-center gap-2 text-center md:w-44">
				<MemberBadge badge={badge.id} size="medal" class="w-32" />
				<p class="text-sm text-roast">{badge.blurb.replace(/^one/, 'One')}</p>
			</div>
		{/if}
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
