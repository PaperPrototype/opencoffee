<script lang="ts">
	import { MapPin, Users } from '@lucide/svelte';
	import type { TicketEvent } from '#lib/landing.js';

	let {
		event,
		layout = 'stacked',
		class: className = ''
	}: {
		event: TicketEvent;
		/** "stacked": photo on top, stub along the bottom. "row": photo left, stub on the right. */
		layout?: 'stacked' | 'row';
		class?: string;
	} = $props();

	const free = $derived(event.price === 'FREE');
	const row = $derived(layout === 'row');
</script>

<a
	href="/event/{event.slug}"
	class="group card-zine card-zine-hover flex overflow-hidden {row
		? 'flex-row'
		: 'flex-col shadow-zine-lg'} {className}"
>
	<div
		class="overflow-hidden border-espresso {row
			? 'hidden w-[130px] shrink-0 border-r-2 sm:block'
			: 'aspect-[4/3] border-b-2'}"
	>
		<img
			src={event.image}
			alt={event.title}
			loading="lazy"
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
		/>
	</div>

	<div class="flex min-w-0 flex-1 flex-col gap-2.5 p-4">
		<div class="flex items-start gap-3">
			<div
				class="flex size-14 shrink-0 flex-col items-center justify-center rounded-[10px] border-2 border-espresso bg-primary text-primary-content"
			>
				<span class="font-mono text-[22px] leading-none font-semibold">{event.day}</span>
				<span class="mt-1 font-mono text-[10px] tracking-[0.1em]">{event.month}</span>
			</div>
			<div class="min-w-0">
				<p class="font-mono text-[11px] tracking-[0.12em] text-crema uppercase">{event.weekday}</p>
				<h4
					class="mt-1 line-clamp-2 font-sans text-base leading-snug font-semibold transition-colors group-hover:text-primary"
				>
					{event.title}
				</h4>
			</div>
		</div>
		<p class="flex items-center gap-1.5 truncate font-mono text-xs text-crema">
			<MapPin class="size-3.5 shrink-0 text-primary" />
			<span class="truncate">{event.location}</span>
			<span class="opacity-50">·</span>
			<Users class="size-3.5 shrink-0" />{event.going} going
		</p>
		<div class="mt-auto flex flex-wrap gap-1.5">
			{#each event.tags as tag (tag)}
				<span class="chip">{tag}</span>
			{/each}
		</div>
	</div>

	<!-- Tear-off stub -->
	<div
		class="flex items-center justify-center gap-3 border-dashed border-espresso transition-transform duration-300 group-hover:rotate-1 {row
			? 'min-w-[92px] flex-col border-l-2 p-4'
			: 'flex-row border-t-2 px-4 py-3'}"
	>
		<span
			class="font-mono font-semibold whitespace-nowrap {free ? 'text-accent' : 'text-espresso'} {row
				? 'text-[17px]'
				: 'text-[15px]'}">{event.price}</span
		>
		<img src="/img/ticket-qr.svg" alt="" loading="lazy" class="size-12 opacity-90" />
		<span class="chip bg-base-200">{event.tags[0]}</span>
	</div>
</a>
