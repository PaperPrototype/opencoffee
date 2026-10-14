<script lang="ts">
	import { Check, Download, RotateCcw, ScanLine, Undo2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { formatWhen } from '#lib/events.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const event = $derived(data.event);
	let filter = $state('');

	const orders = $derived(
		data.orders.filter((o) => {
			const q = filter.trim().toLowerCase();
			if (!q) return true;
			return [o.buyer_name, o.buyer_email, ...o.tickets.map((t) => t.code)].some((v) => v?.toLowerCase().includes(q));
		})
	);

	const orderChip = {
		completed: 'border-accent text-accent',
		refunded: 'border-error text-error',
		cancelled: 'bg-base-300'
	} as Record<string, string>;
</script>

<svelte:head>
	<title>Guests — {event.title}</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-5xl px-6 py-14">
	<a href="/host/events/{event.id}" class="font-mono text-xs tracking-[0.12em] text-crema uppercase hover:text-primary">← Manage event</a>
	<div class="mt-6 flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="eyebrow">Guest list</p>
			<h1 class="display mt-2 text-[36px] leading-tight font-semibold tracking-[-0.02em]">{event.title}</h1>
			<p class="font-mono text-xs text-crema">{formatWhen(event)}</p>
		</div>
		<a href="/host/events/{event.id}/attendees/export" class="btn btn-zine bg-base-100 btn-sm" download><Download class="size-4" /> Export CSV</a>
	</div>

	<dl class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
		{#each [
			['Tickets', String(data.stats.tickets)],
			['Checked in', `${data.stats.checkedIn} / ${data.stats.tickets}`],
			['Sales', formatMoney(data.stats.gross, event.currency, { free: false })],
			['You keep', formatMoney(data.stats.gross - data.stats.fees, event.currency, { free: false })]
		] as [label, value] (label)}
			<div class="card-zine p-4">
				<dt class="font-mono text-[11px] tracking-[0.14em] text-crema uppercase">{label}</dt>
				<dd class="mt-1 font-mono text-2xl font-semibold">{value}</dd>
			</div>
		{/each}
	</dl>

	<!-- Door check-in -->
	<form method="POST" action="?/checkIn" class="mt-8 card-zine p-5" use:enhance>
		<label for="code" class="flex items-center gap-2 font-semibold"><ScanLine class="size-5 text-primary" /> Check someone in</label>
		<div class="mt-3 flex flex-wrap gap-2">
			<input id="code" name="code" autocomplete="off" autocapitalize="characters" class="input h-11 flex-1 field-zine font-mono tracking-[0.12em] uppercase" placeholder="Ticket code (or scan the QR)" defaultValue={form && 'code' in form ? form.code : ''} />
			<button class="btn h-11 btn-primary btn-zine">Check in</button>
		</div>
		{#if form?.checkedIn}
			<p role="status" class="mt-3 flex items-center gap-1.5 text-sm text-accent"><Check class="size-4" /> {form.checkedIn} {form.undo ? 'un-checked' : 'checked in'}.</p>
		{:else if form?.message}
			<p role="alert" class="mt-3 text-sm text-error">{form.message}</p>
		{/if}
		{#if form?.refunded}
			<p role="status" class="mt-3 text-sm text-accent">Order refunded and its tickets voided.</p>
		{/if}
	</form>

	<div class="mt-10 flex flex-wrap items-center justify-between gap-3">
		<h2 class="text-2xl font-medium">Orders</h2>
		<input type="search" bind:value={filter} placeholder="Search name, email, code" class="input h-10 w-64 field-zine text-sm" />
	</div>

	{#if orders.length === 0}
		<p class="mt-5 text-roast">{data.orders.length ? 'No matches.' : 'No one has registered yet.'}</p>
	{:else}
		<ul class="mt-5 space-y-3">
			{#each orders as order (order.id)}
				<li class="card-zine p-4">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="font-semibold">{order.buyer_name || 'Guest'}</p>
							<p class="truncate font-mono text-xs text-crema">{order.buyer_email}</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-mono text-sm font-semibold">{formatMoney(order.total, order.currency)}</span>
							<span class="chip {orderChip[order.status]}">{order.status}</span>
							{#if order.status === 'completed'}
								<form
									method="POST"
									action="?/refund"
									use:enhance={({ cancel }) => {
										const what = order.total > 0 ? `Refund ${formatMoney(order.total, order.currency)} to ${order.buyer_email}` : `Cancel ${order.buyer_name || 'this'} registration`;
										if (!confirm(`${what} and void their tickets?`)) cancel();
									}}
								>
									<input type="hidden" name="order" value={order.id} />
									<button class="btn btn-ghost btn-xs text-error"><RotateCcw class="size-3" /> {order.total > 0 ? 'Refund' : 'Cancel'}</button>
								</form>
							{/if}
						</div>
					</div>
					<ul class="mt-3 flex flex-wrap gap-2">
						{#each order.tickets as t (t.id)}
							<li class="flex items-center gap-2 rounded-[10px] border-2 px-2.5 py-1 font-mono text-xs {t.status === 'void' ? 'border-line text-crema line-through' : t.checked_in_at ? 'border-accent bg-accent/10' : 'border-espresso'}">
								<span class="tracking-[0.1em]">{t.code}</span>
								<span class="text-crema">{t.ticket_types?.name}</span>
								{#if t.status === 'valid'}
									<form method="POST" action="?/checkIn" use:enhance>
										<input type="hidden" name="code" value={t.code} />
										{#if t.checked_in_at}
											<input type="hidden" name="undo" value="1" />
											<button class="flex items-center gap-1 text-accent" title="Undo check-in"><Check class="size-3.5" /><Undo2 class="size-3" /></button>
										{:else}
											<button class="underline decoration-primary hover:text-primary">Check in</button>
										{/if}
									</form>
								{/if}
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	{/if}
</main>
