<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { Avatar, AvatarPicker } from 'avatars';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

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
	<p class="mt-3 font-mono text-[13px] text-crema">{data.email} · member since {memberSince}</p>

	{#if page.url.searchParams.get('updated') === 'password'}
		<div role="status" class="mt-6 flex items-center gap-2 rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
			<Check class="size-4" /> Password updated.
		</div>
	{/if}

	<form method="POST" action="?/profile" class="mt-10 card-zine p-8 shadow-zine-lg" use:enhance={() => async ({ update }) => update({ reset: false })}>
		<h2 class="text-2xl font-medium">Profile</h2>
		<p class="mt-1 text-sm text-roast">Shown to other members.</p>

		{#if form?.message}
			<div role="alert" class="mt-5 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">{form.message}</div>
		{/if}

		<div class="mt-6 border-b-2 border-line pb-6">
			<AvatarPicker userId={data.userId} icon={data.profile.avatar_icon} hue={data.profile.avatar_hue} />
		</div>

		<fieldset class="fieldset mt-4 gap-1">
			<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="display_name">Display name</label>
			<input id="display_name" name="display_name" maxlength="80" class="input h-12 w-full field-zine" value={data.profile.display_name ?? ''} />
			<label class="fieldset-legend mt-3 font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="bio">Bio</label>
			<textarea id="bio" name="bio" maxlength="1000" class="textarea h-28 w-full field-zine" placeholder="Barista, roaster, home brewer…">{data.profile.bio ?? ''}</textarea>
		</fieldset>

		<div class="mt-6 flex items-center gap-4">
			<button type="submit" class="btn btn-primary btn-zine">Save profile</button>
			{#if form?.saved}<span class="flex items-center gap-1.5 text-sm text-accent"><Check class="size-4" /> Saved</span>{/if}
		</div>
	</form>

	<form method="POST" action="/auth/signout" class="mt-8">
		<button type="submit" class="link-zine text-[15px]">Sign out</button>
	</form>
</main>
