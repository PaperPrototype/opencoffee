<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { cubicOut } from 'svelte/easing';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	const signedIn = $derived(!!page.data.session);

	/** Sections that exist so far; the rest still point home. */
	const links: Record<string, string> = { Events: '/events', 'For Organizers': '/host' };
	const nav = ['Events', 'For Organizers', 'Discussions', 'Knowledge', 'Jobs', 'For Trainers', 'Manifesto'];
	const ticker = [
		'☕ Free to join',
		'Open knowledge',
		'No dumb questions',
		'Community-driven',
		"Everyone's welcome"
	];

	/** Width at which the full nav fits and the menu button goes away (keep in sync with the classes below). */
	const DESKTOP = 1200;

	let open = $state(false);
	let header: HTMLElement;
	let toggle: HTMLButtonElement;
	let panel = $state<HTMLElement>();
	/** The panel sits right under the header, whose position depends on how far the ticker has scrolled away. */
	let top = $state(0);
	/** Width of the page scrollbar hidden by the scroll lock (0 with overlay scrollbars, e.g. phones). */
	let gutter = $state(0);

	function show() {
		top = header.getBoundingClientRect().bottom;
		gutter = innerWidth - document.documentElement.clientWidth;
		open = true;
	}
	function hide({ refocus = true } = {}) {
		if (!open) return;
		open = false;
		if (refocus) toggle.focus();
	}

	// Following a link (or any navigation) closes the menu.
	afterNavigate(() => hide({ refocus: false }));

	// Lock the page behind the menu, and move focus into it. Hiding overflow removes a space-taking
	// scrollbar (desktop, "always show scrollbars"), which would widen the page and shove the header's
	// right side over; padding by the scrollbar's width keeps everything exactly where it was.
	$effect(() => {
		if (!open) return;
		const root = document.documentElement;
		const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
		root.style.overflow = 'hidden';
		if (gutter) root.style.paddingRight = `${gutter}px`;
		panel?.querySelector<HTMLElement>('a, button')?.focus();
		return () => {
			root.style.overflow = previous.overflow;
			root.style.paddingRight = previous.paddingRight;
		};
	});

	/** Escape closes; Tab cycles between the menu's links and the close button (a focus trap). */
	function onkeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			hide();
			return;
		}
		if (e.key !== 'Tab' || !panel) return;
		const items = [toggle, ...panel.querySelectorAll<HTMLElement>('a, button')];
		const i = items.indexOf(document.activeElement as HTMLElement);
		const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
		e.preventDefault();
		items[next].focus();
	}

	const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** Slides the panel down from behind the header. */
	function slideDown(_: Element, { duration = 420 } = {}) {
		return {
			duration: reducedMotion() ? 0 : duration,
			easing: cubicOut,
			css: (t: number) => `transform: translateY(${(t - 1) * 100}%);`
		};
	}
	/** Staggered rise for each link once the panel is moving. */
	function rise(_: Element, { delay = 0 } = {}) {
		return {
			delay: reducedMotion() ? 0 : delay,
			duration: reducedMotion() ? 0 : 380,
			easing: cubicOut,
			css: (t: number) => `opacity: ${t}; transform: translateY(${(1 - t) * 14}px);`
		};
	}
</script>

<svelte:window {onkeydown} onresize={() => innerWidth >= DESKTOP && hide({ refocus: false })} />

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

<!-- While the menu is open the header goes solid with an ink edge (a shadow, so its height doesn't change). -->
<header
	bind:this={header}
	class="sticky top-0 z-50 {open ? 'bg-base-200 shadow-[0_2px_0_0_var(--color-espresso)]' : 'bg-base-200/95 backdrop-blur-sm'}"
>
	<div class="mx-auto flex h-[72px] max-w-[1344px] items-center justify-between gap-4 px-5 sm:px-8">
		<a href="/" class="flex items-center gap-2.5">
			<img src="/img/logo.svg" alt="" class="size-9" />
			<span class="hidden font-display text-lg font-semibold tracking-tight whitespace-nowrap min-[480px]:block"
				>Specialty Coffee Community</span
			>
		</a>

		<nav class="hidden items-center gap-6 min-[1200px]:flex" aria-label="Main">
			{#each nav as item (item)}
				<a href={links[item] ?? '/'} class="text-[14.5px] font-medium whitespace-nowrap transition-colors hover:text-primary">{item}</a>
			{/each}
		</nav>

		<div class="flex items-center gap-3">
			{#if signedIn}
				<a href="/account" class="btn hidden btn-primary btn-zine px-5 text-sm sm:inline-flex">Account</a>
			{:else}
				<a href="/auth" class="hidden text-[14.5px] font-medium hover:text-primary sm:inline">Sign in</a>
				<a href="/auth?mode=signup" class="btn hidden btn-primary btn-zine px-5 text-sm sm:inline-flex">Join free</a>
			{/if}

			<!-- Two bars that morph into an X -->
			<button
				bind:this={toggle}
				type="button"
				class="relative flex size-11 items-center justify-center rounded-full border-2 border-espresso bg-base-100 transition-colors hover:bg-base-300 min-[1200px]:hidden"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				aria-controls="mobile-menu"
				onclick={() => (open ? hide() : show())}
			>
				<span
					class="absolute h-0.5 w-5 rounded-full bg-espresso transition-transform duration-300 ease-out motion-reduce:transition-none
						{open ? 'rotate-45' : '-translate-y-[4px]'}"
				></span>
				<span
					class="absolute h-0.5 w-5 rounded-full bg-espresso transition-transform duration-300 ease-out motion-reduce:transition-none
						{open ? '-rotate-45' : 'translate-y-[4px]'}"
				></span>
			</button>
		</div>
	</div>
</header>

{#if open}
	<!-- Full-screen menu, sliding down from behind the header (which stays on top with the close button). -->
	<div
		bind:this={panel}
		id="mobile-menu"
		role="dialog"
		aria-modal="true"
		aria-label="Menu"
		class="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-base-200 min-[1200px]:hidden"
		style:top="{top}px"
		style:padding-right="{gutter}px"
		transition:slideDown
	>
		<nav class="mx-auto flex w-full max-w-[1344px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8" aria-label="Main">
			<ul>
				{#each nav as item, i (item)}
					{@const href = links[item] ?? '/'}
					{@const current = href !== '/' && page.url.pathname.startsWith(href)}
					<li in:rise|global={{ delay: 90 + i * 40 }} class="border-b-2 border-line">
						<a
							{href}
							aria-current={current ? 'page' : undefined}
							class="group flex items-center justify-between py-4 font-display text-[32px] leading-none font-semibold tracking-[-0.02em] transition-colors hover:text-primary sm:text-[40px] {current
								? 'text-primary'
								: ''}"
						>
							{item}
							<ArrowRight class="size-6 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
						</a>
					</li>
				{/each}
			</ul>

			<div class="mt-auto pt-10" in:rise|global={{ delay: 90 + nav.length * 40 }}>
				{#if signedIn}
					<a href="/account" class="btn w-full btn-primary btn-zine text-base">Your account</a>
				{:else}
					<div class="grid gap-3 sm:grid-cols-2">
						<a href="/auth?mode=signup" class="btn btn-primary btn-zine text-base">Join free</a>
						<a href="/auth" class="btn btn-zine bg-base-100 text-base">Sign in</a>
					</div>
				{/if}
				<p class="mt-6 text-center font-mono text-[11px] tracking-[0.16em] text-crema uppercase">
					Free to join · Open knowledge · Community-driven
				</p>
			</div>
		</nav>
	</div>
{/if}
