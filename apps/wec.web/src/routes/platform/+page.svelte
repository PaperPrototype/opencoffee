<script lang="ts">
	import { ArrowLeft, ChevronDown, RotateCcw } from '@lucide/svelte';
	import HeatCard from '#lib/components/HeatCard.svelte';
	import { categories, nav, rounds } from '#lib/bracket.js';

	let ambience = $state(true);
	let speed = $state(1);
</script>

<svelte:head>
	<title>Live Demo | World Espresso Championship</title>
	<meta
		name="description"
		content="Experience the World Espresso Championship platform — live scoring, brackets, and blind judging in real time."
	/>
</svelte:head>

<!-- Demo chrome: frames the platform as a simulation -->
<div
	class="flex items-center justify-between gap-4 border-b border-sand/10 bg-espresso px-4 py-2 md:px-6"
>
	<div class="flex min-w-0 items-center gap-4">
		<a
			href="/"
			class="inline-flex shrink-0 items-center gap-2 text-xs font-semibold tracking-[0.1em] text-sand/40 uppercase transition-colors hover:text-sand"
		>
			<ArrowLeft class="size-4" /> <span class="hidden sm:inline">Back to site</span>
		</a>
		<div class="flex min-w-0 items-center gap-3">
			<img src="/img/brandmark-white.png" alt="WEC" class="h-9 w-auto" />
			<div class="hidden min-w-0 md:block">
				<div class="truncate text-[13px] font-bold tracking-[0.15em]">WORLD ESPRESSO CHAMPIONSHIP</div>
				<div class="truncate text-[11px] tracking-[0.05em] text-sand/40">
					Live Scoring Platform — Demonstration
				</div>
			</div>
		</div>
	</div>
	<div class="flex shrink-0 items-center gap-3">
		<span
			class="badge hidden h-auto border-secondary/30 bg-secondary/15 px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-secondary uppercase sm:inline-flex"
			>Simulation</span
		>
		<a href="/contact" class="btn h-8 min-h-0 btn-primary px-4 text-[11px] btn-board hover:border-secondary hover:bg-secondary hover:text-secondary-content">
			Partner with us
		</a>
	</div>
</div>

<div class="bg-secondary px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-secondary-content">
	Demonstration — simulated event data. No real competitors, results or winner are represented.
	<a href="/" class="underline underline-offset-2 hover:text-white">How the cup decides →</a>
</div>

<header class="sticky top-0 z-40 border-b border-sand/10 bg-espresso/95 backdrop-blur">
	<div class="flex flex-col gap-3 px-4 py-3">
		<a href="/" class="group flex items-center gap-3">
			<img src="/img/brandmark-white.png" alt="" class="h-11 w-auto" />
			<div class="min-w-0">
				<div class="text-sm font-bold tracking-widest transition-colors group-hover:text-copper">
					WORLD ESPRESSO CHAMPIONSHIPS
				</div>
				<div class="truncate text-[11px] leading-tight text-sand/60">
					WEC 2026 World Final · Café Unido, Panama City · 26 October 2026
				</div>
			</div>
		</a>
		<nav class="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
			<a
				href="/"
				class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-sand/70 uppercase transition-colors hover:text-copper"
			>
				<RotateCcw class="size-3.5" /> Back to website
			</a>
			{#each nav as item (item)}
				<a href="/" class="text-xs font-semibold tracking-wider text-sand/55 uppercase transition-colors hover:text-sand">
					{item}
				</a>
			{/each}
			<div class="dropdown dropdown-end">
				<button
					tabindex="0"
					class="flex items-center gap-1 text-xs font-semibold tracking-wider text-sand/55 uppercase hover:text-sand"
				>
					More <ChevronDown class="size-3.5" />
				</button>
				<ul tabindex="-1" class="dropdown-content menu z-10 mt-2 w-48 card-board p-2 text-xs">
					<li><a href="/">Press & media</a></li>
					<li><a href="/">The Coffee Dossier</a></li>
					<li><a href="/">Partners</a></li>
				</ul>
			</div>
			<a
				href="/"
				class="btn h-auto min-h-0 border-copper/70 bg-transparent px-3.5 py-1.5 text-xs font-bold tracking-wider text-copper btn-outline hover:border-copper hover:bg-copper hover:text-espresso"
			>
				COMPETE / JUDGE — REGISTER
			</a>
			<span
				class="badge h-auto border-0 bg-sand/10 px-3 py-1 text-xs font-semibold tracking-widest text-sand/80 ring-1 ring-sand/25"
				>BRACKET PUBLISHED</span
			>
			<span class="text-xs text-sand/50 tabular-nums">09:00:00 PAN</span>
		</nav>
	</div>
</header>

<main class="px-4 pt-4">
	<!-- Hero -->
	<section class="relative mb-4 overflow-hidden rounded-3xl shadow-board">
		<div class="absolute inset-0 bg-linear-to-br from-espresso via-[#2c1c12] to-cinnamon-deep"></div>
		<div
			class="absolute inset-0 opacity-60 {ambience ? 'animate-[drift_30s_ease-in-out_infinite_alternate]' : ''}"
			style="background:
				radial-gradient(40% 18% at 22% 78%, rgb(222 204 167 / 0.1), transparent 60%),
				radial-gradient(34% 16% at 68% 30%, rgb(176 106 60 / 0.16), transparent 60%),
				radial-gradient(50% 22% at 48% 55%, rgb(222 204 167 / 0.06), transparent 60%);"
		></div>
		<div class="grain absolute inset-0"></div>

		<div class="relative px-6 py-14 sm:px-12 sm:py-16">
			<p class="text-[10px] font-extrabold tracking-[0.35em] text-accent">
				WEC 2026 WORLD FINAL · PANAMA CITY · 26 OCTOBER
			</p>
			<h1 class="mt-3 max-w-3xl text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl">
				32 champions. One coffee. Every score public. <span class="text-copper">The cup decides.</span>
			</h1>
			<p class="mt-4 max-w-xl text-sm leading-relaxed text-sand/70">
				Blind ballots, live as cast. No names on the cups, no favourites on the board — three judges,
				15/10/8, first to 50. Then the record seals and stays public forever.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<button class="btn h-auto btn-primary px-6 py-3 text-sm btn-board hover:brightness-110">
					▶ Run the 3-minute demo
				</button>
				<a
					href="/"
					class="btn h-auto border-sand/30 bg-transparent px-6 py-3 text-sm text-sand/80 btn-board btn-outline hover:bg-sand/10"
				>
					How the cup decides
				</a>
				<button
					class="ml-auto rounded-full border border-sand/20 px-3 py-1.5 text-[10px] font-bold tracking-widest text-sand/50 hover:text-sand"
					onclick={() => (ambience = !ambience)}
				>
					{ambience ? '⏸ PAUSE AMBIENCE' : '▶ PLAY AMBIENCE'}
				</button>
			</div>
			<p class="mt-3 text-[9px] font-bold tracking-[0.2em] text-sand/35">
				DEMONSTRATION BUILD — SIMULATED EVENT · AMBIENT LOOP 30S, MUTED
			</p>
		</div>
	</section>

	<!-- Demo clock -->
	<div class="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-base-100/70 p-3 shadow-board backdrop-blur">
		<span class="mr-1 text-[10px] font-extrabold tracking-widest text-sand/45">DEMO CLOCK</span>
		<button class="btn h-auto min-h-0 rounded-lg btn-secondary px-3 py-1 text-xs hover:bg-cinnamon-deep">
			▶ START THE DEMO
		</button>
		{#each [1, 2, 4] as s (s)}
			<button
				class="btn h-auto min-h-0 rounded-lg border-0 px-2.5 py-1 text-xs {speed === s
					? 'bg-sand/25 text-sand'
					: 'bg-sand/10 text-sand/70 hover:bg-sand/20'}"
				onclick={() => (speed = s)}>{s}×</button
			>
		{/each}
		<button class="btn h-auto min-h-0 rounded-lg border-0 bg-sand/10 px-3 py-1 text-xs text-sand/80 hover:bg-sand/20">
			SKIP TO NEXT REVEAL
		</button>
		<button class="btn h-auto min-h-0 rounded-lg border-0 bg-sand/10 px-3 py-1 text-xs text-sand/80 hover:bg-sand/20">
			SKIP TO FINAL
		</button>
		<button class="btn h-auto min-h-0 rounded-lg border-0 bg-accent/20 px-3 py-1 text-xs text-accent hover:bg-accent/30">
			SKIP TO THE REVEAL
		</button>
		<span class="ml-auto text-[11px] text-sand/50 tabular-nums">First heat at 09:00:15</span>
	</div>

	<!-- Bracket published -->
	<section class="mb-4 card-board p-5">
		<p class="eyebrow">Bracket published — field confirmed</p>
		<div class="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<div class="text-4xl font-extrabold tabular-nums">32/32</div>
				<div class="text-xs text-sand/60">
					national champions confirmed · one per country · first confirmed, first in
				</div>
			</div>
			<div class="space-y-0.5 text-xs leading-relaxed text-sand/60 lg:text-right">
				<div>
					Draw seed <span class="font-bold text-sand">20261026</span> committed · hash
					<span class="font-mono text-accent">39d158b1</span>
				</div>
				<div>First heat 09:00:15 · 31 heats · 2 stations · target day ≈ 3–4 hours</div>
				<a href="/" class="block font-bold text-info underline underline-offset-2 hover:text-sand">
					Coffee dossier: Finca Santa Teresa Geisha — natural, lot ST-26-114 — green ✓ roast ✓ · gate open (F19.3) →
				</a>
				<a href="/" class="block font-bold text-accent underline underline-offset-2 hover:text-sand">
					Draw ceremony — 25 Oct, 18:00 PAN · watch the bracket being born, verifiable by anyone →
				</a>
				<div class="flex flex-wrap items-center gap-2 pt-1 lg:justify-end">
					<a
						href="/"
						class="inline-flex items-center gap-1.5 rounded-full bg-sand/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sand/70 ring-1 ring-sand/20 hover:bg-sand/15"
					>
						Tempesta <span class="font-semibold text-sand/45">· Official Espresso Machine</span>
					</a>
					<a href="/" class="text-[10px] font-bold tracking-wider text-sand/50 underline underline-offset-2 hover:text-sand">
						The Closing Celebration — the unofficial closing party of world championship week →
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Bracket + stats -->
	<div class="mb-4 grid gap-4 min-[1760px]:grid-cols-[minmax(0,1fr)_320px]">
		<section class="overflow-x-auto rounded-2xl bg-espresso/40 p-3 shadow-board backdrop-blur">
			<p class="text-[9px] font-extrabold tracking-[0.2em] text-sand/40">DEMONSTRATION — SIMULATED DATA</p>
			<div class="flex min-w-[1160px] gap-3">
				{#each rounds as round (round.name)}
					<div class="flex w-[220px] shrink-0 flex-col">
						<div class="mb-2 text-center text-[11px] font-extrabold tracking-[0.2em] text-sand/50 uppercase">
							{round.name}
						</div>
						<div class="flex flex-1 flex-col justify-around gap-3">
							{#each round.heats as heat (heat.id)}
								<HeatCard {heat} />
							{/each}
						</div>
					</div>
				{/each}
				<div
					class="flex w-[220px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl bg-linear-to-b from-secondary/30 to-transparent p-6 text-center ring-1 ring-secondary/30"
				>
					<img src="/img/brandmark-white.png" alt="" class="w-24" />
					<div class="text-xs font-bold tracking-[0.25em] text-sand/70">WORLD ESPRESSO CHAMPION</div>
					<div class="text-[11px] leading-relaxed text-sand/50">
						The winner's identity publishes the moment the emcee fires the reveal on stage.
					</div>
				</div>
			</div>
		</section>

		<aside class="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-4 min-[1760px]:grid-cols-1">
			<div class="rounded-[14px] bg-secondary/20 px-4 py-3 ring-1 ring-secondary/40 sm:col-span-2 lg:col-span-4 min-[1760px]:col-span-1">
				<p class="text-[10px] font-extrabold tracking-[0.25em] text-accent">HOW THE CUP DECIDES — 30 SECONDS</p>
				<p class="mt-1 text-xs leading-relaxed text-sand/85">
					Two cups. Three judges. Blind. Each judge awards <b>Tactile 15</b>, <b>Taste 10</b> and
					<b>Flavour 8</b> — to one of the heat's two freshly randomized cup codes. 99 points per heat,
					<b>50+ wins</b>. Every score publishes as it's cast — the final too. The winner's identity publishes
					the moment the emcee fires the reveal on stage. In earlier rounds the cup-to-athlete mapping
					releases from custody when the third judge confirms. Same coffee, roast, grinder, water and machine
					— only barista execution differs.
				</p>
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Live event stats</p>
				<div class="grid grid-cols-3 gap-2 text-center">
					{#each [['0', 'Ballots'], ['0/31', 'Heats done'], ['—', 'Avg margin']] as [value, label] (label)}
						<div class="rounded-[10px] bg-espresso/60 p-2">
							<div class="text-lg font-extrabold tabular-nums">{value}</div>
							<div class="text-[9px] font-bold tracking-widest text-sand/45 uppercase">{label}</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Category splits — A vs B</p>
				<div class="space-y-3">
					{#each categories as c (c.name)}
						<div>
							<div class="mb-1 flex justify-between text-[10px] font-bold text-sand/70 uppercase">
								<span>{c.name} · {c.points}</span><span>A 0% · B 0%</span>
							</div>
							<div class="flex h-2 overflow-hidden rounded-full bg-espresso"></div>
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Category influence — what decides heats (F7.4a)</p>
				<ol class="space-y-1 text-[11px] text-sand/75">
					{#each categories as c, i (c.name)}
						<li class="flex justify-between">
							<span><span class="mr-1.5 text-sand/40">{i + 1}.</span>{c.name}</span>
							<span><b class="text-sand">0</b><span class="text-sand/45">/0 heats</span></span>
						</li>
					{/each}
				</ol>
				<p class="mt-2 text-[11px] text-sand/40 italic">No completed heats yet.</p>
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Extremes</p>
				<p class="text-[9px] font-bold tracking-widest text-sand/45">CLOSEST HEAT</p>
				<p class="mb-2 text-sand/40">—</p>
				<p class="text-[9px] font-bold tracking-widest text-sand/45">MOST DOMINANT</p>
				<p class="text-sand/40">—</p>
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Station progress</p>
				{#each [['Station 1', 16], ['Station 2', 15]] as [station, total] (station)}
					<div class="mb-2 flex justify-between text-[10px] font-bold text-sand/70 uppercase">
						<span>{station}</span><span>0/{total}</span>
					</div>
					<progress class="progress mb-3 h-1.5 bg-accent text-accent" value="0" max={total}></progress>
				{/each}
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Peer vs judge agreement</p>
				<div class="flex items-center justify-between">
					<span class="text-lg font-extrabold">—</span>
					<span class="text-[10px] text-sand/45">0 peer ballots</span>
				</div>
				<p class="mt-1.5 text-[10px] leading-relaxed text-sand/45">
					Peer-assessment comparison only — athletes cross-taste informed, not blind. Never a measure of
					scoring accuracy, and never blended into any official metric or judge statistic (F9.5a).
				</p>
			</div>

			<div class="rounded-[14px] bg-base-100 p-4 shadow-board">
				<p class="label-muted mb-3">Judge alignment (codes during event)</p>
				<p class="text-[11px] text-sand/40 italic">No completed heats yet.</p>
			</div>
		</aside>
	</div>
</main>

<footer class="border-t border-sand/10 px-4 py-8">
	<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
		<div class="flex items-center gap-4">
			<img src="/img/brandmark-white.png" alt="" class="h-14 w-auto shrink-0" />
			<p class="max-w-md text-xs leading-relaxed text-sand/55">
				To seek the best coffee for the benefit of all. Every ballot, every void, every protocol — public,
				versioned and timestamped. The platform, not the party, carries the brand.
			</p>
		</div>
		<div class="space-y-1 text-xs text-sand/55 md:text-right">
			<p class="text-[11px] font-extrabold tracking-[0.2em] text-copper">WORLDESPRESSOCHAMPIONSHIP.COM</p>
			{#each ['Partners & sponsorship', 'Press & media', 'Espresso Throwdown — run a demo', 'The Coffee Dossier', 'The Closing Celebration — the unofficial closing party of world championship week'] as link (link)}
				<a href="/" class="block underline underline-offset-2 hover:text-sand">{link}</a>
			{/each}
			<p>America/Panama (UTC−5) · all public times in event local time</p>
			<p>
				Demonstration build · Partners appear here and on partner pages — never on the live board. The cup
				is not for sale.
			</p>
		</div>
	</div>
</footer>

<style>
	@keyframes -global-drift {
		from {
			transform: translate3d(-2%, -1%, 0) scale(1);
		}
		to {
			transform: translate3d(2%, 1%, 0) scale(1.06);
		}
	}
</style>
