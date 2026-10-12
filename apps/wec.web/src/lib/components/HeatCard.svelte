<script lang="ts">
	import type { Heat } from '#lib/bracket.js';

	let { heat }: { heat: Heat } = $props();

	const initials = (name: string) =>
		name
			.split(' ')
			.map((w) => w[0])
			.slice(0, 2)
			.join('');
</script>

<button
	class="group w-full rounded-[14px] bg-base-100/60 p-2.5 text-left shadow-board transition-transform hover:-translate-y-0.5"
>
	<div class="mb-2 flex items-start justify-between gap-2">
		<span class="text-[10px] leading-[1.5] font-bold tracking-widest text-sand/50 uppercase">
			{heat.id} · Station {heat.station} · {heat.time}
		</span>
		<span
			class="badge shrink-0 border-0 bg-sand/10 px-2 text-[9px] font-extrabold tracking-widest text-sand/50"
			>SCHEDULED</span
		>
	</div>
	<div class="space-y-1.5">
		{#each heat.slots as slot (typeof slot === 'string' ? slot : slot.name)}
			<div class="flex items-center gap-2 rounded-[10px] bg-espresso/40 px-2 py-1.5">
				{#if typeof slot === 'string'}
					<span class="flex-1 truncate text-xs text-sand/45 italic">{slot}</span>
				{:else}
					{#if slot.photo}
						<img
							src={slot.photo}
							alt=""
							class="size-6 shrink-0 rounded-full bg-sand/10 object-cover ring-2 ring-sand/30"
						/>
					{:else}
						<span
							class="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold ring-2 ring-sand/30"
							>{initials(slot.name)}</span
						>
					{/if}
					<span class="min-w-0 flex-1 truncate text-xs font-semibold group-hover:text-white">{slot.name}</span>
					<img src="/img/flags/{slot.country}.svg" alt="" class="h-4 w-6 shrink-0 rounded-[3px] object-cover" />
					<span
						class="rounded bg-base-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-sand/80 ring-1 ring-sand/20"
						>{slot.country}</span
					>
				{/if}
			</div>
		{/each}
	</div>
</button>
