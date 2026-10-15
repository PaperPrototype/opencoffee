<script lang="ts">
	const explore = ['Manifesto', 'Discussions', 'Knowledge', 'Members', 'Events', 'Careers'];
	const exploreLinks: Record<string, string> = { Events: '/events', Members: '/members' };
	const community = ['Code of Conduct', 'Free-to-Join Pledge', 'Moderation', 'Contact'];
	const finePrint = ['$0 membership fees', '$0 course fees', '0 ads', '0 data sold'];
</script>

<footer class="bg-neutral text-neutral-content">
	<div class="mx-auto grid max-w-[1100px] gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
		<div>
			<a href="/" class="flex items-center gap-3">
				<img src="/img/logo.svg" alt="" class="size-10 invert" />
				<span class="font-display text-lg leading-snug font-semibold">Specialty Coffee Community</span>
			</a>
			<p class="mt-4 text-[15px] leading-relaxed text-neutral-content/70">
				The free, community-driven home for everyone in specialty coffee.
			</p>
			<img src="/img/stamp-free-to-join.svg" alt="" class="mt-8 size-16 animate-[spin_30s_linear_infinite] opacity-80" />
		</div>

		<div>
			<h4 class="eyebrow text-ember">Explore</h4>
			<ul class="mt-4 space-y-2.5">
				{#each explore as item (item)}
					<li><a href={exploreLinks[item] ?? '/'} class="text-[15px] text-neutral-content/80 hover:text-primary">{item}</a></li>
				{/each}
			</ul>
		</div>

		<div>
			<h4 class="eyebrow text-ember">Community</h4>
			<ul class="mt-4 space-y-2.5">
				{#each community as item (item)}
					<li><a href="/" class="text-[15px] text-neutral-content/80 hover:text-primary">{item}</a></li>
				{/each}
			</ul>
		</div>

		<div>
			<h4 class="eyebrow text-ember">The fine print, in plain sight</h4>
			<ul class="mt-4 space-y-1 font-mono text-[13px] text-neutral-content/80">
				{#each finePrint as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="border-t border-neutral-content/15">
		<div
			class="mx-auto flex max-w-[1100px] flex-col gap-2 px-6 py-6 text-sm text-neutral-content/70 md:flex-row md:items-center md:justify-between"
		>
			<p>© 2026 Specialty Coffee Community — built and owned by its members.</p>
			<p class="font-mono text-xs text-neutral-content/50">
				Independent and community-driven. Coffee knowledge should be free.
			</p>
		</div>
	</div>
</footer>
