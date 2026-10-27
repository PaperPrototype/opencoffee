<script lang="ts">
	import { ArrowRight, Check, Pencil, Sparkles } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { PUBLIC_SCC_URL } from '$app/env/public';
	import { page } from '$app/state';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const memberSince = $derived(
		new Date(data.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);
</script>

<svelte:head>
	<title>Your account | World Espresso Championship</title>
</svelte:head>

<SiteNav />

<main class="mx-auto max-w-2xl px-4 py-16">
	<div class="flex items-center gap-5">
		<Avatar
			userId={data.userId}
			icon={data.profile.avatar_icon}
			hue={data.profile.avatar_hue}
			size={72}
			class="ring-2 ring-sand/20"
		/>
		<div class="min-w-0">
			<p class="eyebrow">Your SCC account</p>
			<h1 class="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
				{data.profile.display_name ?? 'Welcome'}
			</h1>
		</div>
	</div>
	<p class="mt-2 text-sm text-sand/55">{data.email} · SCC member since {memberSince}</p>

	{#if page.url.searchParams.get('updated') === 'password'}
		<div role="status" class="mt-6 alert alert-soft text-sm alert-success"><Check class="size-4" /> Password updated.</div>
	{/if}

	{#if page.url.searchParams.get('saved') === 'cv'}
		<div role="status" class="mt-6 alert alert-soft text-sm alert-success"><Check class="size-4" /> Coffee CV saved — it shows on both sites.</div>
	{/if}

	{#if !data.profile.onboarded_at}
		<a href="/welcome" class="mt-10 flex items-center gap-4 rounded-box bg-secondary p-5 text-secondary-content shadow-board transition-colors hover:bg-cinnamon-deep">
			<Sparkles class="size-6 shrink-0" />
			<span class="min-w-0 flex-1">
				<span class="block font-bold">Finish your Coffee CV</span>
				<span class="text-sm opacity-80">Four quick steps so competitors, judges and organizers know who you are.</span>
			</span>
			<ArrowRight class="size-5 shrink-0" />
		</a>
	{/if}

	<section class="mt-10">
		<div class="mb-4 flex items-end justify-between gap-3">
			<div>
				<h2 class="text-xl font-bold">Your Coffee CV</h2>
				<p class="mt-1 text-sm text-sand/55">
					Part of your <a href="{PUBLIC_SCC_URL}/account" class="text-cinnamon-light underline underline-offset-2 hover:text-sand">Specialty Coffee Community</a>
					profile — changes show on both sites.
				</p>
			</div>
			<a href="/welcome" class="btn shrink-0 rounded-lg btn-sm btn-secondary"><Pencil class="size-4" /> Edit</a>
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
			note="Member since {memberSince}"
		/>
	</section>

	<form method="POST" action="/auth/signout" class="mt-10">
		<button type="submit" class="btn rounded-lg border-sand/20 bg-transparent text-sand btn-outline hover:bg-sand/10">Sign out</button>
	</form>
</main>
