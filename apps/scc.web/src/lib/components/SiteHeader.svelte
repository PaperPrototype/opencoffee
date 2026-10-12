<script lang="ts">
	import { Menu, Search } from '@lucide/svelte';

	const nav = [
		'Events',
		'For Organizers',
		'Discussions',
		'Knowledge',
		'Members',
		'Jobs',
		'For Trainers',
		'Producers',
		'Manifesto'
	];
	const ticker = [
		'☕ Free to join',
		'Open knowledge',
		'No dumb questions',
		'Community-driven',
		"Everyone's welcome"
	];
</script>

<!-- Gold ticker; the list is doubled so the -50% marquee loops seamlessly -->
<div class="flex h-9 items-center overflow-hidden border-b-2 border-espresso bg-secondary text-espresso">
	<div class="flex w-max animate-marquee hover:[animation-play-state:paused]">
		{#each [0, 1, 2, 3] as copy (copy)}
			{#each ticker as item (item)}
				<span
					class="px-5 font-mono text-[11px] tracking-[0.16em] whitespace-nowrap uppercase"
					aria-hidden={copy > 0}>{item}</span
				><span class="font-mono text-[11px] opacity-50" aria-hidden="true">·</span>
			{/each}
		{/each}
	</div>
</div>

<header class="sticky top-0 z-50 bg-base-200/95 backdrop-blur-sm">
	<div class="mx-auto flex h-[72px] max-w-[1344px] items-center justify-between gap-4 px-8">
		<a href="/" class="flex items-center gap-2.5">
			<img src="/img/logo.svg" alt="" class="size-9" />
			<span class="hidden font-display text-lg font-semibold tracking-tight whitespace-nowrap min-[480px]:block"
				>Specialty Coffee Community</span
			>
		</a>

		<nav class="hidden items-center gap-6 min-[1360px]:flex">
			{#each nav as item (item)}
				<a href="/" class="text-[14.5px] font-medium whitespace-nowrap transition-colors hover:text-primary">{item}</a>
			{/each}
		</nav>

		<div class="flex items-center gap-3">
			<button
				class="btn hidden size-10 btn-square rounded-xl border-2 border-espresso bg-base-100 hover:bg-base-300 sm:inline-flex"
				aria-label="Search"
			>
				<Search class="size-[18px]" />
			</button>
			<a href="/" class="btn hidden btn-primary btn-zine px-5 text-sm sm:inline-flex">Join free</a>

			<div class="dropdown dropdown-end min-[1360px]:hidden">
				<button
					tabindex="0"
					class="btn size-11 btn-circle border-2 border-espresso bg-base-100"
					aria-label="Menu"
				>
					<Menu class="size-5" />
				</button>
				<ul
					tabindex="-1"
					class="dropdown-content menu z-10 mt-3 w-60 card-zine p-2 shadow-zine"
				>
					{#each nav as item (item)}
						<li><a href="/">{item}</a></li>
					{/each}
					<li class="mt-2 sm:hidden">
						<a href="/" class="btn btn-primary btn-zine">Join free</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</header>
