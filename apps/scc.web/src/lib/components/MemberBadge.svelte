<script lang="ts">
	import { Award } from '@lucide/svelte';
	import { badgeById, type BadgeId } from '#lib/badges.js';

	let {
		badge,
		size = 'chip',
		label = true,
		number,
		class: className = ''
	}: {
		badge: BadgeId | string | null | undefined;
		/** "chip": inline pill for lists. "medal": the round founding-class seal for profiles and the celebration. */
		size?: 'chip' | 'medal';
		/** Medal only: print the small lines (title, serial, url). Turn off for small medals, where they're unreadable. */
		label?: boolean;
		/** Medal only: the holder's member number, printed as the serial ("Nº 001 of 100"). */
		number?: number;
		class?: string;
	} = $props();

	const uid = $props.id();
	const b = $derived(badgeById(badge));

	// The numeral shrinks as it gains digits so "10,000" fits inside the inner ring.
	const numeral = $derived(b ? b.limit.toLocaleString('en-US') : '');
	const numeralSize = $derived((numeral.length <= 3 ? 80 : numeral.length <= 5 ? 74 : 66) * (label ? 1 : 1.2));
	const serial = $derived(
		b &&
			(number
				? `Nº ${String(number).padStart(String(b.limit).length, '0')} of ${numeral}`
				: `Limited to ${numeral}`)
	);

	// Point on the seal at `deg` degrees (0 = 3 o'clock, clockwise) and radius `r`.
	const at = (deg: number, r: number) => {
		const a = (deg * Math.PI) / 180;
		return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
	};
	const rays = Array.from({ length: 72 }, (_, i) => [at(i * 5, 62), at(i * 5, 120)]);
	// Ring ticks sit in the gaps between the top and bottom ring text.
	const bandTicks = [-20, 20, 160, 200].map((d) => [at(d, 160), at(d, 190)]);
	const ringTicks = [0, 90, 180, 270].map((d) => [at(d, 150), at(d, 142)]);
</script>

{#if b}
	{#if size === 'chip'}
		<span class="chip border-espresso {b.tone} {className}" title="{b.label} badge">
			<Award class="size-3" strokeWidth={2.25} />
			{b.label}
		</span>
	{:else}
		<svg
			viewBox="0 0 400 400"
			class="inline-block aspect-square shrink-0 {className}"
			role="img"
			aria-label="{b.title}: founding member badge{number ? `, member ${number.toLocaleString('en-US')}` : ''}"
		>
			<defs>
				<radialGradient id="{uid}-glow">
					<stop offset="0" stop-color="#fffdf8" />
					<stop offset="0.55" stop-color="#fbf6ec" />
					<stop offset="1" stop-color="#f2e9da" />
				</radialGradient>
				<path id="{uid}-top" d="M 34 200 A 166 166 0 0 1 366 200" />
				<path id="{uid}-bottom" d="M 18 200 A 182 182 0 0 0 382 200" />
			</defs>

			<!-- Paper disc and rings -->
			<circle cx="200" cy="200" r="196" fill="url(#{uid}-glow)" />
			<circle cx="200" cy="200" r="192" fill="none" stroke="#241610" stroke-width="1.75" />
			<circle cx="200" cy="200" r="158" fill="none" stroke="#241610" stroke-width="0.75" opacity="0.35" />
			<circle cx="200" cy="200" r="150" fill="none" stroke={b.ink} stroke-width="1.5" />

			<!-- Sunburst behind the numeral -->
			<g stroke={b.ink} stroke-width="0.8" opacity="0.16">
				{#each rays as [p, q]}<line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />{/each}
			</g>

			<!-- Ticks and the 3/9 o'clock crosshairs -->
			<g stroke={b.ink} stroke-width="1.5" stroke-linecap="round">
				{#each bandTicks as [p, q]}<line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />{/each}
				{#each ringTicks as [p, q]}<line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />{/each}
				<line x1="12" y1="200" x2="40" y2="200" />
				<line x1="26" y1="193" x2="26" y2="207" />
				<line x1="360" y1="200" x2="388" y2="200" />
				<line x1="374" y1="193" x2="374" y2="207" />
			</g>

			<!-- Ring text -->
			<g class="font-mono" fill="#241610" font-size="17" font-weight="500" letter-spacing="0.32em">
				<text text-anchor="middle"><textPath href="#{uid}-top" startOffset="50%">SPECIALTY COFFEE COMMUNITY</textPath></text>
				<text text-anchor="middle"><textPath href="#{uid}-bottom" startOffset="50%">FOUNDING CLASS · EST. 2026</textPath></text>
			</g>

			<!-- Mark: the logo's bean-and-speech-bubble, in the tier's ink -->
			<g
				transform="translate(200 {label ? 116 : 120}) scale({label ? 0.17 : 0.2}) translate(-100 -100)"
				fill="none"
				stroke={b.ink}
				stroke-width="2.25"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M100 14 C139 12 181 47 185 95 C189 145 150 186 101 187 C52 188 14 148 15 99 C16 51 61 16 100 14 Z" vector-effect="non-scaling-stroke" />
				<path d="M99 55 C91 72 109 82 100 99 C92 114 108 126 99 145" vector-effect="non-scaling-stroke" />
				<path d="M100 145 C112 143 124 148 130 158 C122 156 115 157 110 161" vector-effect="non-scaling-stroke" />
			</g>

			{#if label}
				<text x="200" y="154" text-anchor="middle" class="font-mono" font-size="10.5" letter-spacing="0.24em" fill="#4a3226">
					FOUNDING MEMBER
				</text>
			{/if}

			<text
				x="200"
				y={label ? 226 : 240}
				text-anchor="middle"
				class="font-display"
				font-size={numeralSize}
				font-weight="500"
				letter-spacing="-0.02em"
				fill={b.ink}
			>
				{numeral}
			</text>

			{#if label}
				<text x="200" y="260" text-anchor="middle" class="font-display" font-size="21" font-style="italic" font-weight="500" fill="#241610">
					{b.title}
				</text>
				<g stroke="#241610" stroke-width="0.9" opacity="0.6">
					<line x1="146" y1="276" x2="191" y2="276" />
					<line x1="209" y1="276" x2="254" y2="276" />
				</g>
				<rect x="196.5" y="272.5" width="7" height="7" transform="rotate(45 200 276)" fill={b.ink} />
				<text x="200" y="298" text-anchor="middle" class="font-mono" font-size="7.4" letter-spacing="0.08em" fill="#241610">
					{serial?.toUpperCase()} · PERMANENT · NEVER REISSUED
				</text>
				<text x="200" y="315" text-anchor="middle" class="font-mono" font-size="6.4" letter-spacing="0.14em" fill="#8c6a4f">
					SPECIALTYCOFFEECOMMUNITY.COM
				</text>
			{/if}
		</svg>
	{/if}
{/if}
