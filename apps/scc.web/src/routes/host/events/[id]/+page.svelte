<script lang="ts">
	import { Check, ExternalLink, EyeOff, Plus, Rocket, Ticket, Trash2, TriangleAlert, Users } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import EventForm from '#lib/components/EventForm.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { formatWhen, utcToZonedInput } from '#lib/events.js';
	import { formatMoney, parseMoney, ticketFee, toMajor } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const event = $derived(data.event);
	const keep = { reset: false };
	const label = 'font-mono text-[11px] tracking-[0.14em] text-crema uppercase';
	const statusChip = {
		draft: 'bg-base-300',
		published: 'border-accent bg-accent/10 text-accent',
		cancelled: 'border-error text-error'
	} as const;

	let confirmCancel = $state('');
	let prices = $state<Record<string, string>>({});

	/** "You keep $9.35 per ticket" for whatever is typed in a price field. */
	function net(key: string, fallback: number) {
		const amount = prices[key] != null ? parseMoney(prices[key], event.currency) : fallback;
		if (!amount) return null;
		return formatMoney(amount - ticketFee(amount, event.currency), event.currency);
	}
	const local = (iso: string | null) => (iso ? utcToZonedInput(iso, event.timezone) : '');
</script>

<svelte:head>
	<title>Manage {event.title} — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

{#snippet ticketFields(t: (typeof data.ticketTypes)[number] | null)}
	{@const key = t?.id ?? 'new'}
	{#if t}<input type="hidden" name="id" value={t.id} />{/if}
	<div class="grid gap-4 sm:grid-cols-[1fr_160px_140px]">
		<div>
			<label class={label} for="name-{key}">Ticket name</label>
			<input id="name-{key}" name="name" required maxlength="80" class="input mt-1 h-11 w-full field-zine" defaultValue={t?.name ?? ''} placeholder="General admission" />
		</div>
		<div>
			<label class={label} for="price-{key}">Price ({event.currency.toUpperCase()})</label>
			<input
				id="price-{key}"
				name="price"
				inputmode="decimal"
				class="input mt-1 h-11 w-full field-zine font-mono"
				defaultValue={t ? toMajor(t.price, event.currency) : '0'}
				disabled={!!t && t.sold > 0}
				oninput={(e) => (prices[key] = e.currentTarget.value)}
			/>
			{#if t && t.sold > 0}<input type="hidden" name="price" value={toMajor(t.price, event.currency)} />{/if}
		</div>
		<div>
			<label class={label} for="qty-{key}">Quantity</label>
			<input id="qty-{key}" name="quantity" type="number" min="0" class="input mt-1 h-11 w-full field-zine" defaultValue={t?.quantity ?? ''} placeholder="Unlimited" />
		</div>
	</div>
	{#if net(key, t?.price ?? 0)}
		<p class="mt-2 font-mono text-xs text-accent">All-in price · you keep {net(key, t?.price ?? 0)} per ticket after our fee</p>
	{:else}
		<p class="mt-2 font-mono text-xs text-crema">Free ticket · no fees</p>
	{/if}
	<details class="mt-3">
		<summary class="cursor-pointer text-sm text-roast">More options</summary>
		<div class="mt-3 grid gap-4 sm:grid-cols-3">
			<div>
				<label class={label} for="max-{key}">Max per order</label>
				<input id="max-{key}" name="max_per_order" type="number" min="1" max="50" class="input mt-1 h-11 w-full field-zine" defaultValue={t?.max_per_order ?? 10} />
			</div>
			<div>
				<label class={label} for="ss-{key}">Sales start</label>
				<input id="ss-{key}" name="sales_start" type="datetime-local" class="input mt-1 h-11 w-full field-zine" defaultValue={local(t?.sales_start ?? null)} />
			</div>
			<div>
				<label class={label} for="se-{key}">Sales end</label>
				<input id="se-{key}" name="sales_end" type="datetime-local" class="input mt-1 h-11 w-full field-zine" defaultValue={local(t?.sales_end ?? null)} />
			</div>
		</div>
		<label class="{label} mt-3 block" for="desc-{key}">Description</label>
		<input id="desc-{key}" name="description" maxlength="500" class="input mt-1 h-11 w-full field-zine" defaultValue={t?.description ?? ''} placeholder="What's included" />
		<label class="mt-3 flex cursor-pointer items-center gap-2 text-sm">
			<input type="checkbox" name="is_hidden" class="checkbox checkbox-sm" defaultChecked={t?.is_hidden ?? false} /> Hidden (not on sale)
		</label>
	</details>
	{#if form?.ticketId === key && form?.message}
		<div role="alert" class="mt-3 rounded-[10px] border-2 border-error bg-error/10 px-3 py-2 text-sm text-error">{form.message}</div>
	{/if}
{/snippet}

<main class="mx-auto max-w-4xl px-6 py-14">
	<a href="/host" class="font-mono text-xs tracking-[0.12em] text-crema uppercase hover:text-primary">← Host dashboard</a>

	<div class="mt-6 flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<span class="chip {statusChip[event.status]}">{event.status}</span>
			<h1 class="display mt-2 text-[36px] leading-tight font-semibold tracking-[-0.02em]">{event.title}</h1>
			<p class="font-mono text-xs text-crema">{formatWhen(event)}</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<a href="/event/{event.slug}" class="btn btn-zine bg-base-100 btn-sm"><ExternalLink class="size-3.5" /> {event.status === 'draft' ? 'Preview' : 'View page'}</a>
			<a href="/host/events/{event.id}/attendees" class="btn btn-zine bg-base-100 btn-sm"><Users class="size-3.5" /> Guest list</a>
		</div>
	</div>

	{#if page.url.searchParams.has('created') && event.status === 'draft'}
		<div role="status" class="mt-6 rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
			Draft saved. We added a free "General admission" ticket — edit it or add paid tickets, then publish.
		</div>
	{/if}
	{#if form?.message && !form?.ticketId}
		<div role="alert" class="mt-6 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">{form.message}</div>
	{/if}
	{#if form?.note}
		<div role="status" class="mt-6 rounded-[10px] border-2 border-secondary bg-secondary/15 px-4 py-3 text-sm">{form.note}</div>
	{/if}

	<!-- Status -->
	<section class="mt-8 card-zine p-6">
		{#if event.status === 'draft'}
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p class="font-semibold">Ready when you are</p>
					<p class="text-sm text-roast">Publishing lists the event on /events and opens registration.</p>
				</div>
				<div class="flex gap-2">
					<form method="POST" action="?/delete" use:enhance>
						<button class="btn btn-ghost btn-sm text-error" onclick={(e) => !confirm('Delete this draft?') && e.preventDefault()}><Trash2 class="size-4" /> Delete</button>
					</form>
					<form method="POST" action="?/publish" use:enhance={() => ({ update }) => update(keep)}>
						<button class="btn btn-primary btn-zine"><Rocket class="size-4" /> Publish</button>
					</form>
				</div>
			</div>
		{:else if event.status === 'published'}
			<div class="flex flex-wrap items-center justify-between gap-4">
				<p class="flex items-center gap-2 font-semibold text-accent"><Check class="size-5" /> Live — taking registrations</p>
				{#if !data.hasOrders}
					<form method="POST" action="?/unpublish" use:enhance={() => ({ update }) => update(keep)}>
						<button class="btn btn-zine bg-base-100 btn-sm"><EyeOff class="size-4" /> Back to draft</button>
					</form>
				{/if}
			</div>
			<details class="mt-5 border-t-2 border-line pt-4">
				<summary class="cursor-pointer text-sm text-error">Cancel this event…</summary>
				<form method="POST" action="?/cancel" class="mt-3" use:enhance={() => ({ update }) => update(keep)}>
					<p class="flex items-start gap-2 text-sm text-roast">
						<TriangleAlert class="mt-0.5 size-4 shrink-0 text-error" />
						Every paid order is refunded in full (the money comes back out of your Stripe balance) and all tickets are voided. This can't be undone.
					</p>
					<label class="{label} mt-3 block" for="confirm">Type the event title to confirm</label>
					<div class="mt-1 flex flex-wrap gap-2">
						<input id="confirm" name="confirm" bind:value={confirmCancel} class="input h-10 flex-1 field-zine" autocomplete="off" />
						<button class="btn btn-error btn-zine btn-sm h-10" disabled={confirmCancel !== event.title}>Cancel event & refund</button>
					</div>
				</form>
			</details>
		{:else}
			<p class="font-semibold text-error">This event was cancelled. Tickets were voided and paid orders refunded.</p>
		{/if}
	</section>

	<!-- Tickets -->
	<section class="mt-10">
		<h2 class="flex items-center gap-2 text-2xl font-medium"><Ticket class="size-6 text-primary" /> Tickets</h2>
		{#if !data.host.stripe_transfers_enabled}
			<p class="mt-2 text-sm text-roast">
				Free tickets only for now. <a href="/host" class="link-zine">Connect Stripe</a> to sell paid tickets.
			</p>
		{/if}

		<ul class="mt-5 space-y-4">
			{#each data.ticketTypes as t (t.id)}
				<li class="card-zine p-5">
					<form method="POST" action="?/saveTicket" use:enhance={() => ({ update }) => update(keep)}>
						<div class="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs">
							<span class="chip bg-base-100">{t.sold} sold{t.quantity != null ? ` / ${t.quantity}` : ''}</span>
							{#if t.is_hidden}<span class="chip bg-base-300">Hidden</span>{/if}
						</div>
						{@render ticketFields(t)}
						<div class="mt-4 flex items-center justify-between gap-2">
							<button formaction="?/deleteTicket" class="btn btn-ghost btn-sm text-error" disabled={event.status === 'cancelled'}>
								<Trash2 class="size-4" /> {t.sold > 0 ? 'Hide' : 'Remove'}
							</button>
							<button class="btn btn-zine bg-base-100 btn-sm" disabled={event.status === 'cancelled'}>Save ticket</button>
						</div>
					</form>
				</li>
			{/each}
		</ul>

		{#if event.status !== 'cancelled'}
			<details class="mt-4 card-zine border-dashed p-5" open={data.ticketTypes.length === 0 || form?.ticketId === 'new'}>
				<summary class="flex cursor-pointer items-center gap-2 font-semibold"><Plus class="size-4" /> Add a ticket type</summary>
				<form method="POST" action="?/saveTicket" class="mt-4" use:enhance>
					{@render ticketFields(null)}
					<div class="mt-4 flex justify-end">
						<button class="btn btn-primary btn-zine btn-sm">Add ticket</button>
					</div>
				</form>
			</details>
		{/if}
	</section>

	<!-- Details -->
	<section class="mt-12">
		<h2 class="text-2xl font-medium">Event details</h2>
		<form
			method="POST"
			action="?/update"
			enctype="multipart/form-data"
			class="mt-5 card-zine p-6 md:p-8"
			use:enhance={() => ({ update }) => update(keep)}
		>
			<EventForm {event} secret={data.secret} currencyLocked={data.ticketTypes.some((t) => t.price > 0)} />
			<div class="mt-8 flex items-center justify-end gap-4 border-t-2 border-line pt-6">
				{#if form?.saved === 'details'}<span class="flex items-center gap-1.5 text-sm text-accent"><Check class="size-4" /> Saved</span>{/if}
				<button class="btn btn-primary btn-zine" disabled={event.status === 'cancelled'}>Save details</button>
			</div>
		</form>
	</section>
</main>
