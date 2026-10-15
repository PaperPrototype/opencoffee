<script lang="ts">
	import { Award, Crown, Medal } from '@lucide/svelte';
	import { badgeById, type BadgeId } from '#lib/badges.js';

	let {
		badge,
		size = 'chip',
		label = true,
		class: className = ''
	}: {
		badge: BadgeId | string | null | undefined;
		/** "chip": inline pill for lists. "medal": large stamp for profiles and the celebration. */
		size?: 'chip' | 'medal';
		/** Medal only: print the badge name on it (turn off for small medals, where it's unreadable). */
		label?: boolean;
		class?: string;
	} = $props();

	const b = $derived(badgeById(badge));
	const Icon = $derived(b?.id === 'founding_10' ? Crown : b?.id === 'first_100' ? Award : Medal);
</script>

{#if b}
	{#if size === 'chip'}
		<span class="chip border-espresso {b.tone} {className}" title="{b.label} badge">
			<Icon class="size-3" strokeWidth={2.25} />
			{b.label}
		</span>
	{:else}
		<!-- A rubber-stamp medal: ink ring, dashed inner ring, icon and label. -->
		<span
			class="@container relative inline-flex aspect-square flex-col items-center justify-center rounded-full border-2 border-espresso shadow-zine {b.tone} {className}"
			role="img"
			aria-label="{b.label} badge"
		>
			<span class="absolute inset-[7%] rounded-full border-[1.5px] border-dashed border-current opacity-60"></span>
			<Icon class={label ? 'size-[34%]' : 'size-[44%]'} strokeWidth={1.75} />
			{#if label}
				<!-- cqw: sized relative to the medal, so the label scales with it. -->
				<span class="mt-[4%] font-mono text-[9cqw] leading-none font-semibold tracking-[0.1em] uppercase">{b.label}</span>
			{/if}
		</span>
	{/if}
{/if}
