<script lang="ts">
	import { enhance } from '$app/forms';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const label = 'fieldset-legend text-[10px] font-extrabold tracking-[0.25em] text-sand/50 uppercase';
</script>

<svelte:head>
	<title>Choose a new password | World Espresso Championship</title>
</svelte:head>

<SiteNav />

<main class="mx-auto flex min-h-[calc(100svh-7.5rem)] max-w-md flex-col justify-center px-4 py-16">
	<p class="eyebrow text-center">Account recovery</p>
	<h1 class="mt-3 text-center text-4xl font-extrabold tracking-tight">Choose a new password</h1>

	<form method="POST" class="mt-8 card-board p-8" use:enhance>
		{#if form?.message}
			<div role="alert" class="mb-5 alert alert-soft text-sm alert-error">{form.message}</div>
		{/if}
		<fieldset class="fieldset gap-1">
			<label class={label} for="password">New password</label>
			<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" class="input h-12 w-full rounded-lg" />
			<label class="{label} mt-3" for="confirm">Confirm password</label>
			<input id="confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password" class="input h-12 w-full rounded-lg" />
		</fieldset>
		<button type="submit" class="btn mt-6 h-12 w-full rounded-lg btn-secondary">Save password</button>
	</form>
</main>
