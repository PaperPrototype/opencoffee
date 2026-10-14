<script lang="ts">
	import { ArrowRight, BadgeCheck, CalendarPlus, Check, CircleDollarSign, ExternalLink, Ticket, Users, Zap } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { categories, coverImage, formatWhen } from '#lib/events.js';
	import { formatMoney, FEE_PERCENT, ticketFee } from '#lib/money.js';
	import { payoutCountries } from '#lib/stripe-countries.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const exampleFee = ticketFee(1000, 'usd');
	const statusChip = {
		draft: 'bg-base-300',
		published: 'border-accent bg-accent/10 text-accent',
		cancelled: 'border-error text-error'
	} as const;

	const label = 'font-mono text-[11px] tracking-[0.14em] text-crema uppercase';
</script>

<svelte:head>
	<title>Host dashboard — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

{#snippet errorBox()}
	{#if form?.message}
		<div role="alert" class="mt-5 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">{form.message}</div>
	{/if}
{/snippet}

{#if !data.host}
	<main class="mx-auto grid max-w-[1100px] gap-12 px-6 py-16 lg:grid-cols-[1fr_440px]">
		<div>
			<p class="eyebrow">Host on Specialty Coffee Community</p>
			<h1 class="display mt-4 text-[44px] leading-[1.08] font-semibold tracking-[-0.025em] md:text-[56px]">
				Run a coffee event. <span class="text-primary italic">Keep the money.</span>
			</h1>
			<p class="mt-5 max-w-[52ch] text-lg leading-relaxed text-roast">
				Cuppings, throwdowns, classes, festivals — list it here and the community finds it.
			</p>
			<ul class="mt-8 space-y-4">
				{#each [
					['Free to list', 'Free events stay free, always. No fees on $0 tickets.'],
					['One small fee on paid tickets', `${FEE_PERCENT}% + a few cents, capped and all-in. On a $10 ticket you keep ${formatMoney(1000 - exampleFee, 'usd')}.`],
					['Paid straight to you', 'Ticket money lands in your own Stripe account. Refund from your dashboard any time.'],
					['Your attendees, your data', 'Export your guest list, check people in at the door with their ticket code.']
				] as [title, body] (title)}
					<li class="flex gap-3">
						<Check class="mt-1 size-5 shrink-0 text-accent" />
						<span><span class="font-semibold">{title}.</span> <span class="text-roast">{body}</span></span>
					</li>
				{/each}
			</ul>
		</div>

		<form method="POST" action="?/create" use:enhance class="card-zine p-8 shadow-zine-lg lg:self-start">
			<h2 class="text-2xl font-medium">Create your host profile</h2>
			<p class="mt-1 text-sm text-roast">This is the name attendees see on your events. You can change it later.</p>
			{@render errorBox()}
			<fieldset class="fieldset mt-5 gap-1">
				<label class={label} for="name">Host name</label>
				<input id="name" name="name" required maxlength="80" class="input h-12 w-full field-zine" defaultValue={data.suggestedName} placeholder="Your café, roastery, or your own name" />
				<label class="{label} mt-3" for="bio">About <span class="normal-case">(optional)</span></label>
				<textarea id="bio" name="bio" maxlength="2000" class="textarea h-24 w-full field-zine" placeholder="What kind of events do you run?"></textarea>
				<label class="{label} mt-3" for="website">Website <span class="normal-case">(optional)</span></label>
				<input id="website" name="website" maxlength="300" class="input h-12 w-full field-zine" placeholder="https://" />
			</fieldset>
			<button type="submit" class="btn mt-6 w-full btn-primary btn-zine">Start hosting <ArrowRight class="size-4" /></button>
		</form>
	</main>
{:else}
	{@const host = data.host}
	<main class="mx-auto max-w-[1100px] px-6 py-14">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="eyebrow">Host dashboard</p>
				<h1 class="display mt-2 text-[40px] leading-tight font-semibold tracking-[-0.02em]">{host.name}</h1>
				<a href="/hosts/{host.slug}" class="font-mono text-xs text-crema uppercase hover:text-primary">Public page →</a>
			</div>
			<a href="/host/events/new" class="btn btn-primary btn-zine"><CalendarPlus class="size-4" /> New event</a>
		</div>

		{@render errorBox()}

		<!-- Payments -->
		<section class="mt-8 card-zine p-6">
			{#if host.stripe_transfers_enabled}
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<BadgeCheck class="size-6 text-accent" />
						<div>
							<p class="font-semibold">Paid ticketing is on</p>
							<p class="text-sm text-roast">
								Ticket money goes to your Stripe account{host.stripe_payouts_enabled ? ' and pays out to your bank.' : '. Add a bank account in Stripe to receive payouts.'}
							</p>
						</div>
					</div>
					<form method="POST" action="?/dashboard">
						<button class="btn btn-zine bg-base-100 text-sm">Stripe dashboard <ExternalLink class="size-3.5" /></button>
					</form>
				</div>
				{#if data.balance.length}
					<div class="mt-5 grid gap-3 border-t-2 border-line pt-5 sm:grid-cols-2">
						{#each data.balance as b (b.currency)}
							<div class="flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-base-200 px-4 py-3">
								<dl class="flex gap-6 font-mono text-sm">
									<div><dt class="text-[10px] text-crema uppercase">Available</dt><dd class="font-semibold">{formatMoney(b.available, b.currency, { free: false })}</dd></div>
									<div><dt class="text-[10px] text-crema uppercase">On the way</dt><dd class="font-semibold">{formatMoney(b.pending, b.currency, { free: false })}</dd></div>
								</dl>
								{#if b.instant > 0}
									<form method="POST" action="?/payout" use:enhance>
										<input type="hidden" name="currency" value={b.currency} />
										<button class="btn btn-zine btn-sm bg-secondary" title="Stripe charges a small fee for instant payouts">
											<Zap class="size-3.5" /> Pay out {formatMoney(b.instant, b.currency, { free: false })} now
										</button>
									</form>
								{/if}
							</div>
						{/each}
					</div>
					<p class="mt-2 text-xs text-crema">Payouts arrive on Stripe's standard schedule. Instant payouts go to an eligible debit card within minutes, for a small Stripe fee.</p>
				{/if}
				{#if form?.paidOut}
					<p role="status" class="mt-3 flex items-center gap-1.5 text-sm text-accent"><Check class="size-4" /> Instant payout started.</p>
				{/if}
			{:else}
				<div class="flex flex-wrap items-start justify-between gap-6">
					<div class="flex max-w-[56ch] gap-3">
						<CircleDollarSign class="mt-0.5 size-6 shrink-0 text-primary" />
						<div>
							<p class="font-semibold">
								{host.stripe_details_submitted ? 'Stripe is reviewing your details' : 'Connect Stripe to sell paid tickets'}
							</p>
							<p class="text-sm text-roast">
								{host.stripe_details_submitted
									? "This usually takes a few minutes. If Stripe needs anything else, continue onboarding."
									: 'Free events work without it. Paid ticket money goes straight to your own Stripe account; we keep one small all-in fee per paid ticket.'}
							</p>
						</div>
					</div>
					<form method="POST" action="?/connect" class="flex flex-wrap items-center gap-2">
						{#if !host.stripe_details_submitted}
							<label class="sr-only" for="country">Country of your bank account</label>
							<select id="country" name="country" class="select h-10 w-48 field-zine text-sm">
								{#each payoutCountries as c (c.code)}<option value={c.code} selected={c.code === data.platformCountry}>{c.name}</option>{/each}
							</select>
						{/if}
						<button class="btn btn-primary btn-zine text-sm">{host.stripe_details_submitted ? 'Continue onboarding' : 'Connect Stripe'}</button>
					</form>
				</div>
			{/if}
		</section>

		<!-- Events -->
		<section class="mt-12">
			<h2 class="text-2xl font-medium">Your events</h2>
			{#if data.events.length === 0}
				<div class="mt-5 card-zine p-10 text-center">
					<p class="text-lg font-medium">No events yet.</p>
					<p class="mt-1 text-roast">Create a draft — nothing is public until you publish.</p>
					<a href="/host/events/new" class="btn mt-5 btn-primary btn-zine"><CalendarPlus class="size-4" /> Create your first event</a>
				</div>
			{:else}
				<ul class="mt-5 space-y-4">
					{#each data.events as event (event.id)}
						<li class="flex flex-col gap-4 card-zine p-4 sm:flex-row sm:items-center">
							<img src={coverImage(event)} alt="" class="hidden aspect-[4/3] w-28 shrink-0 rounded-[10px] border-2 border-espresso object-cover sm:block" />
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<span class="chip {statusChip[event.status]}">{event.status}</span>
									<span class="chip bg-base-100">{categories[event.category].label}</span>
								</div>
								<a href="/host/events/{event.id}" class="mt-1.5 block truncate text-lg font-semibold hover:text-primary">{event.title}</a>
								<p class="font-mono text-xs text-crema">{formatWhen(event)}</p>
							</div>
							<dl class="flex gap-6 font-mono text-sm">
								<div><dt class="text-[10px] text-crema uppercase"><Users class="inline size-3" /> Going</dt><dd class="font-semibold">{event.going}</dd></div>
								<div><dt class="text-[10px] text-crema uppercase">Sales</dt><dd class="font-semibold">{formatMoney(event.gross, event.currency, { free: false })}</dd></div>
								<div><dt class="text-[10px] text-crema uppercase">You keep</dt><dd class="font-semibold text-accent">{formatMoney(event.gross - event.fees, event.currency, { free: false })}</dd></div>
							</dl>
							<div class="flex gap-2 sm:flex-col">
								<a href="/host/events/{event.id}" class="btn btn-zine bg-base-100 btn-sm">Manage</a>
								<a href="/host/events/{event.id}/attendees" class="btn btn-zine bg-base-100 btn-sm"><Ticket class="size-3.5" /> Guests</a>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<!-- Profile -->
		<details class="mt-12 card-zine p-6">
			<summary class="cursor-pointer text-lg font-medium">Host profile</summary>
			<form method="POST" action="?/profile" use:enhance={() => async ({ update }) => update({ reset: false })}>
				<fieldset class="fieldset mt-4 gap-1">
					<label class={label} for="p-name">Host name</label>
					<input id="p-name" name="name" required maxlength="80" class="input h-12 w-full field-zine" defaultValue={host.name} />
					<label class="{label} mt-3" for="p-bio">About</label>
					<textarea id="p-bio" name="bio" maxlength="2000" class="textarea h-24 w-full field-zine" defaultValue={host.bio ?? ''}></textarea>
					<label class="{label} mt-3" for="p-website">Website</label>
					<input id="p-website" name="website" maxlength="300" class="input h-12 w-full field-zine" defaultValue={host.website ?? ''} />
				</fieldset>
				<div class="mt-5 flex items-center gap-4">
					<button class="btn btn-primary btn-zine">Save profile</button>
					{#if form?.saved}<span class="flex items-center gap-1.5 text-sm text-accent"><Check class="size-4" /> Saved</span>{/if}
				</div>
			</form>
		</details>
	</main>
{/if}
