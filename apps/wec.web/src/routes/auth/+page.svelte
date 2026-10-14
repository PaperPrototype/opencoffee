<script lang="ts">
	import { MailCheck } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { PUBLIC_SCC_URL } from '$app/env/public';
	import { page } from '$app/state';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	type Mode = 'signin' | 'signup' | 'forgot';
	const modes: Mode[] = ['signin', 'signup', 'forgot'];
	// A failed action can switch modes (e.g. sign-up with an existing email → sign in).
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

	// WEC has no accounts of its own: people sign in with their Specialty Coffee Community account.
	const copy = {
		signin: { eyebrow: 'World Espresso Championship', title: 'Sign in with SCC', button: 'Sign in with SCC' },
		signup: { eyebrow: 'Free · One account for both', title: 'Create an SCC account', button: 'Create SCC account' },
		forgot: { eyebrow: 'SCC account recovery', title: 'Reset your password', button: 'Send reset link' }
	};
	const label = 'fieldset-legend text-[10px] font-extrabold tracking-[0.25em] text-sand/50 uppercase';
</script>

<svelte:head>
	<title>{copy[mode].title} | World Espresso Championship</title>
</svelte:head>

<SiteNav />

<main class="mx-auto flex min-h-[calc(100svh-7.5rem)] max-w-md flex-col justify-center px-4 py-16">
	{#if form && 'sent' in form}
		<div class="card-board p-8 text-center">
			<MailCheck class="mx-auto size-10 text-cinnamon-light" />
			<h1 class="mt-4 text-3xl font-extrabold tracking-tight">Check your inbox</h1>
			<p class="mt-3 text-[15px] text-sand/70">
				{form.sent === 'signup'
					? 'Confirm your new Specialty Coffee Community account — we sent a link to'
					: 'If an account exists for that email, we sent a reset link to'}
				<b class="text-sand">{form.email}</b>.
			</p>
			<a href="/auth" class="btn mt-6 rounded-lg border-sand/20 bg-transparent text-sand btn-outline hover:bg-sand/10">Back to sign in</a>
		</div>
	{:else}
		<div class="text-center">
			<img src="/img/brandmark-white.png" alt="" class="mx-auto h-16 w-auto" />
			<p class="eyebrow mt-6">{copy[mode].eyebrow}</p>
			<h1 class="mt-3 text-4xl font-extrabold tracking-tight">{copy[mode].title}</h1>
		</div>

		<!-- Account provider: makes it clear this is an SCC account, not a WEC one -->
		<div class="mt-8 flex items-center gap-4 rounded-xl bg-sand px-4 py-3 text-espresso shadow-board">
			<img src="/img/scc-logo.svg" alt="" class="size-10 shrink-0" />
			<p class="text-sm leading-snug">
				WEC uses your <b>Specialty Coffee Community</b> account — the same free account you use on
				<a href={PUBLIC_SCC_URL} class="font-semibold underline underline-offset-2">specialtycoffeecommunity.com</a>.
			</p>
		</div>

		{#if mode !== 'forgot'}
			<div role="tablist" class="tabs-box mt-4 tabs grid grid-cols-2 rounded-xl bg-base-100 shadow-board">
				<a role="tab" href="/auth?mode=signin{nextQuery}" class="tab rounded-lg text-sm font-semibold {mode === 'signin' ? 'tab-active' : ''}">Sign in</a>
				<a role="tab" href="/auth?mode=signup{nextQuery}" class="tab rounded-lg text-sm font-semibold {mode === 'signup' ? 'tab-active' : ''}">New to SCC</a>
			</div>
		{/if}

		<form method="POST" action="?/{mode}{nextQuery}" class="mt-6 card-board p-8" use:enhance={submit}>
			{#if form && 'message' in form}
				<div role="alert" class="mb-5 alert alert-soft text-sm alert-error">{form.message}</div>
			{/if}

			<fieldset class="fieldset gap-1">
				{#if mode === 'signup'}
					<label class={label} for="display_name">Name <span class="tracking-normal normal-case opacity-70">(optional)</span></label>
					<input
						id="display_name"
						name="display_name"
						autocomplete="name"
						class="input h-12 w-full rounded-lg"
						defaultValue={form && 'display_name' in form ? form.display_name : ''}
					/>
				{/if}

				<label class="{label} {mode === 'signup' ? 'mt-3' : ''}" for="email">Email</label>
				<input id="email" name="email" type="email" required autocomplete="email" class="input h-12 w-full rounded-lg" defaultValue={email} />

				{#if mode !== 'forgot'}
					<div class="mt-3 flex items-baseline justify-between">
						<label class={label} for="password">Password</label>
						{#if mode === 'signin'}
							<a href="/auth?mode=forgot" class="text-xs text-cinnamon-light hover:text-sand">Forgot password?</a>
						{/if}
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength="8"
						autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
						class="input h-12 w-full rounded-lg"
					/>
					{#if mode === 'signup'}<p class="label text-xs">At least 8 characters.</p>{/if}
				{/if}
			</fieldset>

			<button type="submit" class="btn mt-6 h-12 w-full rounded-lg btn-secondary" disabled={pending}>
				{#if pending}<span class="loading loading-sm loading-spinner"></span>{/if}
				{copy[mode].button}
			</button>

			{#if mode === 'forgot'}
				<p class="mt-5 text-center text-sm"><a href="/auth" class="text-cinnamon-light hover:text-sand">Back to sign in</a></p>
			{/if}
		</form>
	{/if}
</main>
