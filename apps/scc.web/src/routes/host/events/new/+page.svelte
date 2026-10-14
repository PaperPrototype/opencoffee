<script lang="ts">
	import { enhance } from '$app/forms';
	import EventForm from '#lib/components/EventForm.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let saving = $state(false);
</script>

<svelte:head>
	<title>New event — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-3xl px-6 py-14">
	<a href="/host" class="font-mono text-xs tracking-[0.12em] text-crema uppercase hover:text-primary">← Host dashboard</a>
	<p class="eyebrow mt-6">New event</p>
	<h1 class="display mt-2 text-[40px] leading-tight font-semibold tracking-[-0.02em]">What are you hosting?</h1>
	<p class="mt-2 text-roast">This saves as a draft. Add tickets and publish when you're ready.</p>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="mt-10 card-zine p-6 shadow-zine-lg md:p-8"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				saving = false;
				await update({ reset: false });
			};
		}}
	>
		{#if form?.message}
			<div role="alert" class="mb-6 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">{form.message}</div>
		{/if}
		<EventForm />
		<div class="mt-8 flex justify-end border-t-2 border-line pt-6">
			<button class="btn btn-primary btn-zine" disabled={saving}>
				{#if saving}<span class="loading loading-sm loading-spinner"></span>{/if} Save draft & add tickets
			</button>
		</div>
	</form>
</main>
