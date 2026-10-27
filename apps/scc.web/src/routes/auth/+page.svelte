<script lang="ts">
	import { ArrowRight, Check, MailCheck } from '@lucide/svelte';
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
		signin: {
			eyebrow: 'Welcome back',
			title: ['Good to see you ', 'again.'],
			lead: 'Sign in to your tickets, your Coffee CV and the member directory.',
			button: 'Sign in'
		},
		signup: {
			eyebrow: 'Free to join · No tiers',
			title: ['Your coffee work, ', 'ready to be seen.'],
			lead: 'One free account for events, the member directory and the World Espresso Championship.',
			button: 'Create account'
		},
		forgot: {
			eyebrow: 'Happens to everyone',
			title: ['Reset your ', 'password.'],
			lead: 'Enter the email you signed up with and we’ll send you a link to choose a new one.',
			button: 'Send reset link'
		}
	};

	/** What joining looks like, start to finish. */
	const journey = [
		{ title: 'Create your account', text: 'Email and a password. That’s it.' },
		{ title: 'Confirm your email', text: 'One click from your inbox.' },
		{ title: 'Build your Coffee CV', text: 'Your role, skills and experience — about two minutes.' }
	];
	const label = 'block font-mono text-[11px] tracking-[0.14em] text-crema uppercase';
</script>

<svelte:head>
	<title>{mode === 'signup' ? 'Join' : mode === 'signin' ? 'Sign in' : 'Reset password'} — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto grid max-w-[1180px] gap-x-16 gap-y-10 px-6 py-14 md:py-20 lg:grid-cols-[1fr_440px]">
	<!-- Pitch -->
	<div class="lg:pt-6">
		<p class="eyebrow">{form && 'sent' in form ? 'Almost there' : copy[mode].eyebrow}</p>
		<h1 class="display mt-4 max-w-[14ch] text-[44px] leading-[1.02] font-semibold tracking-[-0.035em] md:text-[64px]">
			{#if form && 'sent' in form}
				Check your <span class="text-primary italic">inbox.</span>
			{:else}
				{copy[mode].title[0]}<span class="text-primary italic">{copy[mode].title[1]}</span>
			{/if}
		</h1>
		<p class="mt-5 max-w-[46ch] text-roast">
			{form && 'sent' in form ? 'Your link is on its way. Open it on this device to carry on.' : copy[mode].lead}
		</p>
	</div>

	<!-- Form (or confirmation) -->
	<div class="lg:row-span-2 lg:self-center">
		{#if form && 'sent' in form}
			<div class="card-zine p-8 shadow-zine-lg">
				<MailCheck class="size-10 text-primary" />
				<p class="mt-4 text-[15px] text-roast">
					{form.sent === 'signup'
						? 'We sent a confirmation link to'
						: 'If an account exists for that email, we sent a reset link to'}
					<b class="break-all text-espresso">{form.email}</b>.
				</p>
				<p class="mt-3 text-sm text-crema">Nothing there? Check spam, or wait a minute and try again.</p>
				<a href="/auth" class="link-zine mt-6 text-[15px]">Back to sign in</a>
			</div>
		{:else}
			<form
				method="POST"
				action="?/{mode}{nextQuery}"
				class="card-zine p-6 shadow-zine-lg sm:p-8"
				use:enhance={submit}
			>
				{#if form && 'message' in form}
					<div role="alert" class="mb-5 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">
						{form.message}
					</div>
				{/if}

				<div class="grid gap-4">
					{#if mode === 'signup'}
						<label class="block">
							<span class={label}>Your name</span>
							<input
								name="display_name"
								autocomplete="name"
								maxlength="80"
								class="input mt-2 h-12 w-full field-zine"
								placeholder="Daniel Ortega"
								defaultValue={form && 'display_name' in form ? form.display_name : ''}
							/>
						</label>
					{/if}

					<label class="block">
						<span class={label}>Email</span>
						<input
							name="email"
							type="email"
							required
							autocomplete="email"
							placeholder="you@coffeeplace.com"
							class="input mt-2 h-12 w-full field-zine"
							defaultValue={email}
						/>
					</label>

					{#if mode !== 'forgot'}
						<label class="block">
							<span class="{label} flex items-baseline justify-between">
								Password
								{#if mode === 'signin'}
									<a href="/auth?mode=forgot" class="tracking-normal normal-case underline decoration-primary underline-offset-4 hover:text-primary">Forgot?</a>
								{:else}
									<span class="tracking-normal normal-case opacity-70">8+ characters</span>
								{/if}
							</span>
							<input
								name="password"
								type="password"
								required
								minlength="8"
								autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
								class="input mt-2 h-12 w-full field-zine"
							/>
						</label>
					{/if}
				</div>

				<button type="submit" class="btn mt-6 h-12 w-full btn-primary btn-zine text-[15px]" disabled={pending}>
					{#if pending}<span class="loading loading-sm loading-spinner"></span>{/if}
					{copy[mode].button}
					{#if !pending}<ArrowRight class="size-4" />{/if}
				</button>

				<p class="mt-5 border-t-2 border-line pt-5 text-center text-sm text-roast">
					{#if mode === 'signin'}
						New here? <a href="/auth?mode=signup{nextQuery}" class="link-zine">Join free</a>
					{:else if mode === 'signup'}
						Already a member? <a href="/auth?mode=signin{nextQuery}" class="link-zine">Sign in</a>
					{:else}
						<a href="/auth" class="link-zine">Back to sign in</a>
					{/if}
				</p>
			</form>
			{#if mode !== 'forgot'}
				<p class="mt-4 text-center text-xs text-crema">The same account signs you in to the World Espresso Championship.</p>
			{/if}
		{/if}
	</div>

	<!-- What happens next (joining only) -->
	{#if mode === 'signup' || (form && 'sent' in form && form.sent === 'signup')}
		{@const current = form && 'sent' in form ? 1 : 0}
		<ol class="grid max-w-xl gap-3">
			{#each journey as item, i (item.title)}
				<li class="flex items-start gap-4 rounded-[12px] border-2 border-espresso p-4 {i === current ? 'bg-base-100 shadow-zine-sm' : ''} {i < current ? 'opacity-60' : ''}">
					<span class="grid size-8 shrink-0 place-items-center rounded-full border-2 border-espresso font-mono text-sm font-semibold {i === current ? 'bg-primary text-primary-content' : i < current ? 'bg-espresso text-paper' : 'bg-base-100'}">
						{#if i < current}<Check class="size-4" />{:else}{i + 1}{/if}
					</span>
					<span>
						<span class="block font-semibold">{item.title}</span>
						<span class="text-sm text-roast">{item.text}</span>
					</span>
				</li>
			{/each}
			<li class="mt-1 font-mono text-[11px] tracking-[0.12em] text-crema uppercase">No card. No tiers. No ‘premium’.</li>
		</ol>
	{/if}
</main>
