<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { badgeById, formatMemberNumber } from '#lib/badges.js';
	import MemberBadge from '#lib/components/MemberBadge.svelte';

	let {
		memberNumber,
		badge,
		name
	}: { memberNumber: number; badge: string; name: string | null } = $props();

	const b = $derived(badgeById(badge)!);
	let open = $state(true);
	let primary = $state<HTMLAnchorElement>();

	// Theme colours: gold, terracotta, olive, ember, milk.
	const colors = ['#d9a441', '#c4572a', '#66703c', '#e07840', '#fffdf8'];

	onMount(() => {
		// Seen: don't show it again, even if this tab is closed mid-celebration.
		fetch('/api/celebrated', { method: 'POST' }).catch(() => {});
		primary?.focus();

		let cancelled = false;
		import('canvas-confetti').then(({ default: confetti }) => {
			if (cancelled) return;
			const fire = (opts: confetti.Options) =>
				confetti({ colors, disableForReducedMotion: true, zIndex: 120, ...opts });
			// A burst from the middle, then a cannon from each side.
			fire({ particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.55 } });
			setTimeout(() => {
				if (cancelled) return;
				fire({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
				fire({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
			}, 350);
		});
		return () => {
			cancelled = true;
		};
	});

	const close = () => (open = false);

	function pop(_: Element) {
		return { duration: 420, easing: cubicOut, css: (t: number) => `opacity:${t}; transform: scale(${0.85 + 0.15 * t}) rotate(${(1 - t) * -4}deg);` };
	}
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && close()} />

{#if open}
	<div class="fixed inset-0 z-[110] flex items-center justify-center bg-espresso/45 p-5 backdrop-blur-[2px]" transition:fade={{ duration: 200 }}>
		<!-- Click outside to close -->
		<button type="button" class="absolute inset-0 cursor-default" aria-label="Close" tabindex="-1" onclick={close}></button>

		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="celebration-title"
			class="relative w-full max-w-md card-zine p-8 text-center shadow-zine-lg"
			in:pop
		>
			<MemberBadge badge={b.id} size="medal" class="w-32 animate-[spin_1.1s_cubic-bezier(.2,.8,.2,1)_1] motion-reduce:animate-none" />
			<p class="eyebrow mt-6">Welcome{name ? `, ${name}` : ''}</p>
			<h2 id="celebration-title" class="display mt-2 text-[40px] leading-[1.05] font-semibold tracking-[-0.02em]">
				You're member <span class="text-primary">{formatMemberNumber(memberNumber)}</span>
			</h2>
			<p class="mt-4 text-roast">
				That makes you {b.blurb} of Specialty Coffee Community. Your
				<strong class="text-espresso">{b.label}</strong> badge is on your profile for good.
			</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
				<a bind:this={primary} href="/members/{memberNumber}" class="btn btn-primary btn-zine" onclick={close}>See your profile</a>
				<button type="button" class="btn btn-zine bg-base-100" onclick={close}>Start exploring</button>
			</div>
		</div>
	</div>
{/if}
