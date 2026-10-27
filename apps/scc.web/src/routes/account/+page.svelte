<script lang="ts">
	import { ArrowRight, CalendarPlus, Check, Pencil, Sparkles, Ticket } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { page } from '$app/state';
	import { badgeFor, formatMemberNumber } from '#lib/badges.js';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import MemberBadge from '#lib/components/MemberBadge.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const memberSince = $derived(
		new Date(data.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);
</script>

<svelte:head>
	<title>Your account — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-2xl px-6 py-16">
	<div class="flex items-center gap-5">
		<Avatar
			userId={data.userId}
			icon={data.profile.avatar_icon}
			hue={data.profile.avatar_hue}
			size={72}
			class="border-2 border-espresso shadow-zine-sm"
		/>
		<div class="min-w-0">
			<p class="eyebrow">Your account</p>
			<h1 class="display mt-1 text-[40px] leading-tight font-semibold tracking-[-0.02em]">
				Hello{data.profile.display_name ? `, ${data.profile.display_name}` : ''}.
			</h1>
		</div>
	</div>
	<p class="mt-3 font-mono text-[13px] text-crema">
		{data.email} · <a href="/members/{data.profile.member_number}" class="underline decoration-primary underline-offset-4 hover:text-primary">member {formatMemberNumber(data.profile.member_number)}</a> since {memberSince}
	</p>
	{#if badgeFor(data.profile.member_number)}
		<MemberBadge badge={badgeFor(data.profile.member_number)?.id} class="mt-3" />
	{/if}

	{#if page.url.searchParams.get('updated') === 'password'}
		<div role="status" class="mt-6 flex items-center gap-2 rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
			<Check class="size-4" /> Password updated.
		</div>
	{/if}

	{#if !data.profile.onboarded_at}
		<a href="/welcome" class="mt-10 flex items-center gap-4 card-zine card-zine-hover bg-secondary p-5">
			<Sparkles class="size-6 shrink-0" />
			<span class="min-w-0 flex-1">
				<span class="block font-semibold">Finish your Coffee CV</span>
				<span class="text-sm text-roast">Four quick steps so members, hosts and employers know who you are.</span>
			</span>
			<ArrowRight class="size-5 shrink-0" />
		</a>
	{/if}

	<section class="mt-10">
		<div class="mb-4 flex items-end justify-between gap-3">
			<h2 class="text-2xl font-medium">Your Coffee CV</h2>
			<a href="/welcome" class="link-zine text-sm"><Pencil class="size-4" /> Edit</a>
		</div>
		<CoffeeCv
			userId={data.userId}
			memberNumber={data.profile.member_number}
			name={data.profile.display_name}
			headline={data.profile.headline}
			location={data.profile.location}
			avatarIcon={data.profile.avatar_icon}
			avatarHue={data.profile.avatar_hue}
			bio={data.profile.bio}
			roles={data.profile.roles}
			yearsInCoffee={data.profile.years_in_coffee}
			skills={data.profile.skills}
			experience={data.profile.experience}
			availability={data.profile.availability}
			website={data.profile.website}
			instagram={data.profile.instagram}
			strip={['Public Coffee CV', `Member since ${memberSince}`]}
		/>
	</section>

	<div class="mt-8 grid gap-4 sm:grid-cols-2">
		<a href="/account/tickets" class="card-zine card-zine-hover flex items-center gap-4 p-5">
			<Ticket class="size-6 text-primary" />
			<span><span class="block font-semibold">Your tickets</span><span class="text-sm text-roast">Events you're going to</span></span>
		</a>
		<a href="/host" class="card-zine card-zine-hover flex items-center gap-4 p-5">
			<CalendarPlus class="size-6 text-primary" />
			<span><span class="block font-semibold">Host events</span><span class="text-sm text-roast">List events, sell tickets</span></span>
		</a>
	</div>

	<form method="POST" action="/auth/signout" class="mt-8">
		<button type="submit" class="link-zine text-[15px]">Sign out</button>
	</form>
</main>
