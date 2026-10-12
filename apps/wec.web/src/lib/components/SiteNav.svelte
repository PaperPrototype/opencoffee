<script lang="ts">
	import { ChevronDown, CircleAlert, Menu, X } from '@lucide/svelte';
	import { menus } from '#lib/site.js';

	let announcement = $state(true);
</script>

<header class="sticky top-0 z-50 border-b border-sand/10 bg-espresso/90 backdrop-blur-md">
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
		<a href="/" class="flex shrink-0 items-center gap-3">
			<img src="/img/brandmark-white.png" alt="" class="h-12 w-auto" />
			<span class="leading-tight">
				<span class="block text-base font-bold tracking-[0.15em]">WORLD ESPRESSO</span>
				<span class="block text-xs tracking-[0.3em] text-cinnamon-light">CHAMPIONSHIP</span>
			</span>
		</a>

		<nav class="hidden items-center gap-1 lg:flex">
			{#each menus.slice(0, 2) as menu (menu.label)}
				<div class="dropdown dropdown-hover">
					<button tabindex="0" class="btn gap-1 btn-ghost px-3 text-sm font-normal text-sand/80 hover:text-sand">
						{menu.label} <ChevronDown class="size-3.5 opacity-60" />
					</button>
					<ul tabindex="-1" class="dropdown-content menu z-10 w-56 card-board p-2 text-sm">
						{#each menu.links as link (link)}
							<li><a href="/">{link}</a></li>
						{/each}
					</ul>
				</div>
			{/each}
			<a href="/platform" class="btn btn-ghost px-3 text-sm font-normal text-accent">Live Demo</a>
			<a href="/" class="btn btn-ghost px-3 text-sm font-normal text-sand/80 hover:text-sand">News</a>
			<div class="dropdown dropdown-end dropdown-hover">
				<button tabindex="0" class="btn gap-1 btn-ghost px-3 text-sm font-normal text-sand/80 hover:text-sand">
					More <ChevronDown class="size-3.5 opacity-60" />
				</button>
				<ul tabindex="-1" class="dropdown-content menu z-10 w-48 card-board p-2 text-sm">
					{#each menus[2].links.slice(1) as link (link)}
						<li><a href="/">{link}</a></li>
					{/each}
				</ul>
			</div>
		</nav>

		<div class="flex items-center gap-2">
			<a href="#partner" class="btn hidden rounded-lg btn-secondary px-4 text-sm sm:inline-flex">Partner With Us</a>
			<div class="dropdown dropdown-end lg:hidden">
				<button tabindex="0" class="btn btn-square btn-ghost" aria-label="Menu">
					<Menu class="size-6" />
				</button>
				<ul tabindex="-1" class="dropdown-content menu z-10 mt-3 w-72 card-board p-3">
					{#each menus as menu (menu.label)}
						<li>
							<details>
								<summary class="font-semibold">{menu.label}</summary>
								<ul>
									{#each menu.links as link (link)}
										<li><a href="/">{link}</a></li>
									{/each}
								</ul>
							</details>
						</li>
					{/each}
					<li><a href="/platform" class="font-semibold text-accent">Live Demo</a></li>
					<li class="mt-2">
						<a href="#partner" class="btn rounded-lg btn-secondary">Partner With Us</a>
					</li>
				</ul>
			</div>
		</div>
	</div>

	{#if announcement}
		<div class="border-t border-sand/5 bg-linear-to-r from-cinnamon/25 via-cinnamon/10 to-cinnamon/25">
			<div class="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 text-sm">
				<CircleAlert class="hidden size-4 shrink-0 text-cinnamon-light sm:block" />
				<p class="text-sand/85">
					<b class="text-cinnamon-light">WEC 2027 Tokyo is ready to run — gated by funding.</b>
					<span class="hidden md:inline">2 May 2027 — the day after the World Barista Championship final.</span>
					<a href="/" class="text-cinnamon-light underline underline-offset-2 hover:text-sand">Read the statement →</a>
				</p>
				<button
					class="btn btn-circle size-6 min-h-0 shrink-0 btn-ghost text-sand/50"
					aria-label="Dismiss"
					onclick={() => (announcement = false)}
				>
					<X class="size-3.5" />
				</button>
			</div>
		</div>
	{/if}
</header>
