<script lang="ts">
	import { MailCheck } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	type Mode = 'signin' | 'signup' | 'forgot';
	// A failed action can switch modes (e.g. sign-up with an existing email → sign in).
	const modes: Mode[] = ['signin', 'signup', 'forgot'];
	const mode = $derived.by(() => {
		const requested = (form && 'mode' in form ? form.mode : null) ?? page.url.searchParams.get('mode');
		return modes.includes(requested as Mode) ? (requested as Mode) : 'signin';
	});
	const email = $derived(
		(form && 'email' in form ? form.email : null) ?? page.url.searchParams.get('email') ?? ''
	);
	const next = $derived(page.url.searchParams.get('next'));
	const nextQuery = $derived(next ? `&next=${encodeURIComponent(next)}` : '');

	let pending = $state(false);
	const submit = () => {
		pending = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			pending = false;
		};
	};

	const copy = {
		signin: { eyebrow: 'Welcome back', title: 'Sign in', button: 'Sign in' },
		signup: { eyebrow: 'Free to join', title: 'Join the community', button: 'Join free' },
		forgot: { eyebrow: 'Happens to everyone', title: 'Reset your password', button: 'Send reset link' }
	};
</script>

<svelte:head>
	<title>{copy[mode].title} — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto flex min-h-[calc(100svh-108px)] max-w-md flex-col justify-center px-6 py-16">
	{#if form && 'sent' in form}
		<div class="card-zine p-8 text-center shadow-zine-lg">
			<MailCheck class="mx-auto size-10 text-primary" />
			<h1 class="display mt-4 text-3xl font-semibold">Check your inbox</h1>
			<p class="mt-3 text-[15px] text-roast">
				{form.sent === 'signup'
					? 'We sent a confirmation link to'
					: 'If an account exists for that email, we sent a reset link to'}
				<b class="text-espresso">{form.email}</b>.
			</p>
			<a href="/auth" class="link-zine mt-6 text-[15px]">Back to sign in</a>
		</div>
	{:else}
		<p class="eyebrow">{copy[mode].eyebrow}</p>
		<h1 class="display mt-3 text-[44px] leading-tight font-semibold tracking-[-0.02em]">
			{copy[mode].title}
		</h1>

		{#if mode !== 'forgot'}
			<div role="tablist" class="mt-8 grid grid-cols-2 card-zine p-1 shadow-zine-sm">
				<a
					role="tab"
					href="/auth?mode=signin{nextQuery}"
					class="rounded-[10px] py-2 text-center text-[15px] font-semibold {mode === 'signin'
						? 'bg-espresso text-paper'
						: 'hover:text-primary'}">Sign in</a
				>
				<a
					role="tab"
					href="/auth?mode=signup{nextQuery}"
					class="rounded-[10px] py-2 text-center text-[15px] font-semibold {mode === 'signup'
						? 'bg-espresso text-paper'
						: 'hover:text-primary'}">Join free</a
				>
			</div>
		{/if}

		<form
			method="POST"
			action="?/{mode}{next ? `&next=${encodeURIComponent(next)}` : ''}"
			class="mt-6 card-zine p-8 shadow-zine-lg"
			use:enhance={submit}
		>
			{#if form && 'message' in form}
				<div role="alert" class="mb-5 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">
					{form.message}
				</div>
			{/if}

			<fieldset class="fieldset gap-1">
				{#if mode === 'signup'}
					<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="display_name">
						Your name <span class="normal-case opacity-70">(optional)</span>
					</label>
					<input
						id="display_name"
						name="display_name"
						autocomplete="name"
						class="input h-12 w-full field-zine"
						defaultValue={form && 'display_name' in form ? form.display_name : ''}
					/>
				{/if}

				<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase {mode === 'signup' ? 'mt-3' : ''}" for="email">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autocomplete="email"
					placeholder="you@coffeeplace.com"
					class="input h-12 w-full field-zine"
					defaultValue={email}
				/>

				{#if mode !== 'forgot'}
					<div class="mt-3 flex items-baseline justify-between">
						<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="password">
							Password
						</label>
						{#if mode === 'signin'}
							<a href="/auth?mode=forgot" class="text-sm text-roast underline decoration-primary underline-offset-4 hover:text-primary">
								Forgot?
							</a>
						{/if}
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength="8"
						autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
						class="input h-12 w-full field-zine"
					/>
					{#if mode === 'signup'}
						<p class="label text-xs text-crema">At least 8 characters.</p>
					{/if}
				{/if}
			</fieldset>

			<button type="submit" class="btn mt-6 h-12 w-full btn-primary btn-zine text-[15px]" disabled={pending}>
				{#if pending}<span class="loading loading-sm loading-spinner"></span>{/if}
				{copy[mode].button}
			</button>

			{#if mode === 'forgot'}
				<p class="mt-5 text-center text-sm">
					<a href="/auth" class="link-zine">Back to sign in</a>
				</p>
			{/if}
		</form>

		{#if mode === 'signup'}
			<p class="mt-6 text-center font-mono text-xs tracking-[0.1em] text-crema uppercase">
				No card. No tiers. No 'premium'.
			</p>
		{/if}
		{#if mode !== 'forgot'}
			<p class="mt-4 text-center text-sm text-roast">
				Your SCC account also signs you in to the World Espresso Championship.
			</p>
		{/if}
	{/if}
</main>
