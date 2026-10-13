<script lang="ts">
	import { enhance } from '$app/forms';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Choose a new password — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto flex min-h-[calc(100svh-108px)] max-w-md flex-col justify-center px-6 py-16">
	<p class="eyebrow">Almost there</p>
	<h1 class="display mt-3 text-[44px] leading-tight font-semibold tracking-[-0.02em]">Choose a new password</h1>

	<form method="POST" class="mt-8 card-zine p-8 shadow-zine-lg" use:enhance>
		{#if form?.message}
			<div role="alert" class="mb-5 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">
				{form.message}
			</div>
		{/if}
		<fieldset class="fieldset gap-1">
			<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="password">New password</label>
			<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" class="input h-12 w-full field-zine" />
			<label class="fieldset-legend mt-3 font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="confirm">Confirm password</label>
			<input id="confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password" class="input h-12 w-full field-zine" />
		</fieldset>
		<button type="submit" class="btn mt-6 h-12 w-full btn-primary btn-zine text-[15px]">Save password</button>
	</form>
</main>
