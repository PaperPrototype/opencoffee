<script lang="ts">
	import { CalendarDays, Clock, Globe, MapPin, Minus, Pencil, Plus, Ticket, TriangleAlert, Users } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { categories, coverImage, formatDateLong, formatTime, formatWhen, priceLabel } from '#lib/events.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const event = $derived(data.event);
	const signedIn = $derived(!!page.data.session);
	const open = $derived(event.status === 'published' && Date.parse(event.ends_at) > Date.now());

	let quantities = $state<Record<string, number>>({});
	let submitting = $state(false);

	const maxFor = (t: (typeof data.tickets)[number]) => Math.min(t.max_per_order, t.left ?? Infinity);
	const step = (t: (typeof data.tickets)[number], by: number) => {
		quantities[t.id] = Math.max(0, Math.min((quantities[t.id] ?? 0) + by, maxFor(t)));
	};

	const count = $derived(Object.values(quantities).reduce((a, b) => a + b, 0));
	const total = $derived(data.tickets.reduce((sum, t) => sum + t.price * (quantities[t.id] ?? 0), 0));
	const allFree = $derived(data.tickets.length > 0 && data.tickets.every((t) => t.price === 0));

	const mapsUrl = $derived(
		`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
			[event.venue_name, event.address, event.city, event.country].filter(Boolean).join(', ')
		)}`
	);
</script>

<svelte:head>
	<title>{event.title} — Specialty Coffee Community</title>
	{#if event.summary}<meta name="description" content={event.summary} />{/if}
	<meta property="og:title" content={event.title} />
	<meta property="og:image" content={coverImage(event)} />
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-[1200px] px-6 pt-8 pb-24 md:px-8">
	{#if event.status === 'draft'}
		<div role="status" class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-2 border-secondary bg-secondary/15 px-4 py-3 text-sm">
			<span>Draft preview — only you can see this page until you publish it.</span>
			<a href="/host/events/{event.id}" class="link-zine text-sm"><Pencil class="size-4" /> Edit event</a>
		</div>
	{:else if event.status === 'cancelled'}
		<div role="alert" class="mb-6 flex items-center gap-2 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">
			<TriangleAlert class="size-4" /> This event has been cancelled. Paid tickets were refunded.
		</div>
	{:else if data.isHost}
		<div class="mb-6 flex justify-end">
			<a href="/host/events/{event.id}" class="link-zine text-sm"><Pencil class="size-4" /> Manage event</a>
		</div>
	{/if}

	<div class="overflow-hidden card-zine shadow-zine-lg">
		<img src={coverImage(event)} alt="" class="aspect-[2/1] max-h-[460px] w-full object-cover md:aspect-[21/9]" />
	</div>

	<div class="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
		<article class="min-w-0">
			<div class="flex flex-wrap items-center gap-2">
				<span class="chip bg-base-100">{categories[event.category].label}</span>
				{#if allFree}<span class="chip border-accent text-accent">Free</span>{/if}
				{#if event.is_online}<span class="chip bg-base-100"><Globe class="size-3" /> Online</span>{/if}
			</div>
			<h1 class="display mt-4 text-[40px] leading-[1.08] font-semibold tracking-[-0.025em] md:text-[56px]">{event.title}</h1>
			{#if event.summary}
				<p class="mt-4 max-w-[60ch] text-lg leading-relaxed text-roast">{event.summary}</p>
			{/if}

			<dl class="mt-8 grid gap-4 sm:grid-cols-2">
				<div class="flex gap-3 rounded-box border-2 border-line bg-base-100 p-4">
					<CalendarDays class="mt-0.5 size-5 shrink-0 text-primary" />
					<div>
						<dt class="font-mono text-[11px] tracking-[0.14em] text-crema uppercase">When</dt>
						<dd class="mt-1 font-medium">{formatDateLong(event.starts_at, event.timezone)}</dd>
						<dd class="text-sm text-roast">{formatWhen(event)}</dd>
						<dd class="mt-1"><a href="/event/{event.slug}/calendar.ics" class="link-zine text-sm" download>Add to calendar</a></dd>
					</div>
				</div>
				<div class="flex gap-3 rounded-box border-2 border-line bg-base-100 p-4">
					<MapPin class="mt-0.5 size-5 shrink-0 text-primary" />
					<div class="min-w-0">
						<dt class="font-mono text-[11px] tracking-[0.14em] text-crema uppercase">Where</dt>
						{#if event.is_online}
							<dd class="mt-1 font-medium">Online</dd>
							<dd class="text-sm text-roast">{data.secret?.online_url ? 'Your joining link is below.' : 'The joining link is on your ticket once you register.'}</dd>
						{:else}
							<dd class="mt-1 font-medium">{event.venue_name || event.city || 'To be announced'}</dd>
							<dd class="text-sm text-roast">{[event.address, event.city, event.country].filter(Boolean).join(', ')}</dd>
							{#if event.address || event.venue_name}
								<dd class="mt-1"><a href={mapsUrl} target="_blank" rel="noopener noreferrer" class="link-zine text-sm">Open in Maps</a></dd>
							{/if}
						{/if}
					</div>
				</div>
			</dl>

			{#if data.secret?.online_url || data.secret?.attendee_info}
				<section class="mt-8 rounded-box border-2 border-accent bg-accent/10 p-5">
					<p class="eyebrow text-accent">For ticket holders</p>
					{#if data.secret.online_url}
						<p class="mt-2"><span class="font-semibold">Join online:</span> <a href={data.secret.online_url} target="_blank" rel="noopener noreferrer" class="link-zine break-all">{data.secret.online_url}</a></p>
					{/if}
					{#if data.secret.attendee_info}
						<p class="mt-2 whitespace-pre-line text-roast">{data.secret.attendee_info}</p>
					{/if}
				</section>
			{/if}

			{#if event.description}
				<section class="mt-12">
					<h2 class="text-2xl font-medium">About this event</h2>
					<div class="mt-4 max-w-[68ch] leading-relaxed whitespace-pre-line text-roast">{event.description}</div>
				</section>
			{/if}

			{#if event.refund_policy}
				<section class="mt-10">
					<h2 class="text-xl font-medium">Refund policy</h2>
					<p class="mt-2 max-w-[68ch] text-[15px] whitespace-pre-line text-roast">{event.refund_policy}</p>
				</section>
			{/if}

			<section class="mt-12 border-t-2 border-line pt-8">
				<p class="eyebrow">Hosted by</p>
				<a href="/hosts/{data.host.slug}" class="group mt-3 flex items-center gap-4">
					<span class="flex size-14 items-center justify-center rounded-full border-2 border-espresso bg-secondary font-display text-xl font-semibold">
						{data.host.name.slice(0, 1).toUpperCase()}
					</span>
					<span>
						<span class="block text-lg font-semibold group-hover:text-primary">{data.host.name}</span>
						<span class="font-mono text-xs text-crema uppercase">See all their events →</span>
					</span>
				</a>
			</section>
		</article>

		<!-- Ticket panel -->
		<aside id="tickets" class="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
			<div class="card-zine p-6 shadow-zine-lg">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-xl font-medium"><Ticket class="size-5 text-primary" /> Tickets</h2>
					<span class="chip bg-base-100"><Users class="size-3 text-primary" /> {data.going} going</span>
				</div>

				{#if data.myTickets.length}
					<a href="/account/tickets" class="mt-4 flex items-center justify-between rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
						<span>You're going · {data.myTickets.length} {data.myTickets.length === 1 ? 'ticket' : 'tickets'}</span>
						<span class="font-semibold underline">View</span>
					</a>
				{/if}

				{#if form?.message}
					<div role="alert" class="mt-4 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">{form.message}</div>
				{/if}

				{#if data.tickets.length === 0}
					<p class="mt-5 text-sm text-roast">Tickets aren't on sale yet.</p>
				{:else}
					<form
						method="POST"
						action="?/register"
						use:enhance={() => {
							submitting = true;
							return async ({ update }) => {
								submitting = false;
								await update({ reset: false });
							};
						}}
					>
						<ul class="mt-5 divide-y-2 divide-line">
							{#each data.tickets as t (t.id)}
								<li class="py-4 first:pt-0">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<p class="font-semibold">{t.name}</p>
											<p class="font-mono text-sm {t.price === 0 ? 'text-accent' : ''}">{formatMoney(t.price, event.currency)}</p>
											{#if t.description}<p class="mt-1 text-[13px] leading-snug text-roast">{t.description}</p>{/if}
											{#if t.state === 'soon' && t.sales_start}
												<p class="mt-1 flex items-center gap-1 font-mono text-[11px] text-crema uppercase">
													<Clock class="size-3" /> On sale {formatDateLong(t.sales_start, event.timezone)}, {formatTime(t.sales_start, event.timezone)}
												</p>
											{:else if t.state === 'on_sale' && t.left != null && t.left <= 20}
												<p class="mt-1 font-mono text-[11px] text-primary uppercase">Only {t.left} left</p>
											{/if}
										</div>
										{#if !open || t.state === 'on_sale'}
											{#if open}
												<div class="flex shrink-0 items-center gap-1.5">
													<button type="button" class="btn size-8 btn-circle border-2 border-espresso bg-base-100 btn-sm" aria-label="Fewer {t.name}" disabled={!quantities[t.id]} onclick={() => step(t, -1)}>
														<Minus class="size-3.5" />
													</button>
													<input type="hidden" name="qty:{t.id}" value={quantities[t.id] ?? 0} />
													<span class="w-6 text-center font-mono font-semibold" aria-live="polite">{quantities[t.id] ?? 0}</span>
													<button type="button" class="btn size-8 btn-circle border-2 border-espresso bg-base-100 btn-sm" aria-label="More {t.name}" disabled={(quantities[t.id] ?? 0) >= maxFor(t)} onclick={() => step(t, 1)}>
														<Plus class="size-3.5" />
													</button>
												</div>
											{/if}
										{:else}
											<span class="chip shrink-0 bg-base-300">{t.state === 'sold_out' ? 'Sold out' : t.state === 'ended' ? 'Sales ended' : 'Soon'}</span>
										{/if}
									</div>
								</li>
							{/each}
						</ul>

						{#if open}
							<div class="mt-2 flex items-baseline justify-between border-t-2 border-dashed border-espresso pt-4">
								<span class="font-mono text-xs tracking-[0.12em] text-crema uppercase">Total · all-in</span>
								<span class="font-mono text-xl font-semibold">{formatMoney(total, event.currency)}</span>
							</div>
							{#if signedIn}
								<button type="submit" class="btn mt-5 w-full btn-primary btn-zine" disabled={count === 0 || submitting}>
									{#if submitting}<span class="loading loading-sm loading-spinner"></span>{/if}
									{total > 0 ? 'Checkout' : 'Register'}{count ? ` · ${count} ${count === 1 ? 'ticket' : 'tickets'}` : ''}
								</button>
								{#if total > 0}
									<p class="mt-3 text-center text-[12px] text-crema">Secure payment by Stripe. No checkout fees.</p>
								{/if}
							{:else}
								<a href="/auth?next={encodeURIComponent(page.url.pathname)}" class="btn mt-5 w-full btn-primary btn-zine">Sign in to register</a>
								<p class="mt-3 text-center text-[12px] text-crema">
									Free to join. <a href="/auth?mode=signup&next={encodeURIComponent(page.url.pathname)}" class="underline">Create an account</a>
								</p>
							{/if}
						{:else}
							<p class="mt-4 text-center text-sm text-roast">
								{event.status === 'draft' ? 'Publish the event to open registration.' : event.status === 'cancelled' ? 'Registration is closed.' : 'This event has ended.'}
							</p>
						{/if}
					</form>
				{/if}
			</div>
		</aside>
	</div>
</main>

<!-- Phones: the ticket panel sits below the description, so keep a way to it on screen. -->
{#if open && data.tickets.length && !data.myTickets.length}
	<div class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t-2 border-espresso bg-base-100 px-4 py-3 lg:hidden">
		<span class="font-mono text-sm font-semibold">{priceLabel(data.tickets.map((t) => t.price), event.currency)}</span>
		<a href="#tickets" class="btn btn-primary btn-zine btn-sm">Get tickets</a>
	</div>
	<div class="h-16 lg:hidden" aria-hidden="true"></div>
{/if}

<SiteFooter />
