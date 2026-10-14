<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { Avatar, AvatarPicker } from 'avatars';
	import { enhance } from '$app/forms';
	import { PUBLIC_SCC_URL } from '$app/env/public';
	import { page } from '$app/state';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const memberSince = $derived(
		new Date(data.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);
	const label = 'fieldset-legend text-[10px] font-extrabold tracking-[0.25em] text-sand/50 uppercase';
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

	<form method="POST" action="?/profile" class="mt-10 card-board p-8" use:enhance={() => async ({ update }) => update({ reset: false })}>
		<h2 class="text-xl font-bold">Profile</h2>
		<p class="mt-1 text-sm text-sand/55">
			Part of your <a href="{PUBLIC_SCC_URL}/account" class="text-cinnamon-light underline underline-offset-2 hover:text-sand">Specialty Coffee Community</a>
			profile — changes show on both sites.
		</p>

		{#if form?.message}
			<div role="alert" class="mt-5 alert alert-soft text-sm alert-error">{form.message}</div>
		{/if}

		<div class="mt-6 border-b border-sand/10 pb-6">
			<AvatarPicker userId={data.userId} icon={data.profile.avatar_icon} hue={data.profile.avatar_hue} />
		</div>

		<fieldset class="fieldset mt-4 gap-1">
			<label class={label} for="display_name">Display name</label>
			<input id="display_name" name="display_name" maxlength="80" class="input h-12 w-full rounded-lg" defaultValue={data.profile.display_name ?? ''} />
			<label class="{label} mt-3" for="bio">Bio</label>
			<textarea id="bio" name="bio" maxlength="1000" class="textarea h-28 w-full rounded-lg" defaultValue={data.profile.bio ?? ''}></textarea>
		</fieldset>

		<div class="mt-6 flex items-center gap-4">
			<button type="submit" class="btn rounded-lg btn-secondary">Save profile</button>
			{#if form?.saved}<span class="flex items-center gap-1.5 text-sm text-success"><Check class="size-4" /> Saved</span>{/if}
		</div>
	</form>

	<form method="POST" action="/auth/signout" class="mt-8">
		<button type="submit" class="btn rounded-lg border-sand/20 bg-transparent text-sand btn-outline hover:bg-sand/10">Sign out</button>
	</form>
</main>
