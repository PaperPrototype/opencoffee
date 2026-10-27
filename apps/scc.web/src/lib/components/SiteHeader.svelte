<script lang="ts">
	import { ArrowRight, ArrowUpRight, Settings } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { cubicOut } from 'svelte/easing';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { badgeFor, formatMemberNumber } from '#lib/badges.js';
	import MemberBadge from '#lib/components/MemberBadge.svelte';

	const signedIn = $derived(!!page.data.session);
	/** The signed-in member (from the root layout); their profile is where their badge lives. */
	const me = $derived(page.data.me);
	const badge = $derived(me ? badgeFor(me.memberNumber) : null);
	const profileHref = $derived(me ? `/members/${me.memberNumber}` : '/account');

	const links: Record<string, string> = {
		'Coffee CV': '/members',
		Jobs: '/jobs',
		Events: '/events',
		'For Organizers': '/host',
		Learn: '/learn',
		Manifesto: '/manifesto'
	};
	const nav = ['Coffee CV', 'Jobs', 'Events', 'For Organizers', 'Learn', 'Manifesto'];

	/** Width at which the full nav fits and the menu button goes away (keep in sync with the classes below). */
	const DESKTOP = 1200;

	let open = $state(false);
	let header: HTMLElement;
	let toggle: HTMLButtonElement;
	let panel = $state<HTMLElement>();
	/** The panel sits right under the header, whose position depends on how far the banner has scrolled away. */
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

<!-- Terracotta call-to-action strip: the founding signup, or (signed in) a way back to your badge -->
<a
	href={me ? profileHref : '/auth?mode=signup'}
	class="flex min-h-11 items-center justify-center gap-2 border-b-2 border-espresso bg-primary px-4 py-2.5 text-center text-[15px] font-semibold text-primary-content transition-colors hover:bg-[#a84620]"
>
	{#if me && badge}
		You're founding member {formatMemberNumber(me.memberNumber)} — see your badge
	{:else if me}
		You're member {formatMemberNumber(me.memberNumber)} — view your Coffee CV
	{:else}
		Join free — get your founding member number
	{/if}
	<ArrowRight class="size-4 shrink-0" />
</a>

<!-- While the menu is open the header goes solid with an ink edge (a shadow, so its height doesn't change). -->
<header
	bind:this={header}
	class="sticky top-0 z-50 border-b-2 border-espresso {open ? 'bg-base-200' : 'bg-base-200/95 backdrop-blur-sm'}"
>
	<div class="mx-auto flex h-[76px] max-w-[1344px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8">
		<a href="/" class="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Specialty Coffee Community home">
			<img src="/img/scc-logo.svg" alt="" class="size-10 shrink-0 sm:size-12" />
			<span class="min-w-0 leading-none">
				<span class="block font-display text-[22px] leading-none font-semibold tracking-[-0.025em] uppercase sm:text-[26px]">Community</span>
				<span class="mt-1.5 hidden font-mono text-[8px] tracking-[0.08em] whitespace-nowrap uppercase opacity-75 min-[420px]:block">Specialty Coffee · Free to join</span>
			</span>
		</a>

		<nav class="hidden items-center gap-7 min-[1200px]:flex" aria-label="Main">
			{#each nav as item (item)}
				{@const href = links[item] ?? '/'}
				<a
					{href}
					aria-current={href !== '/' && page.url.pathname.startsWith(href) ? 'page' : undefined}
					class="text-[15px] font-medium whitespace-nowrap transition-colors hover:text-primary aria-[current=page]:text-primary"
					>{item}</a
				>
			{/each}
		</nav>

		<div class="flex shrink-0 items-center gap-2 sm:gap-3">
			{#if signedIn}
				<!-- Profile button: your avatar and badge, through to your public Coffee CV -->
				<a
					href={profileHref}
					class="flex h-12 items-center gap-2 rounded-full border-2 border-espresso bg-base-100 py-1 pr-1 pl-1 shadow-zine-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-zine sm:pr-4"
					aria-label="Your profile{badge ? ` (${badge.label} badge)` : ''}"
				>
					{#if me}
						<Avatar userId={me.userId} icon={me.avatarIcon} hue={me.avatarHue} size={36} class="border-[1.5px] border-espresso" />
					{/if}
					<span class="hidden text-sm font-semibold whitespace-nowrap sm:inline">Your profile</span>
					{#if badge}<MemberBadge badge={badge.id} size="medal" label={false} class="hidden w-8 sm:inline-block" />{/if}
				</a>
				<a
					href="/account"
					class="hidden size-11 items-center justify-center rounded-full border-2 border-espresso bg-base-100 transition-colors hover:bg-base-300 sm:flex"
					aria-label="Account settings"
					title="Account settings"
				>
					<Settings class="size-[18px]" />
				</a>
			{:else}
				<a href="/auth" class="hidden text-[15px] font-medium hover:text-primary sm:inline">Sign in</a>
				<a href="/auth?mode=signup" class="btn hidden btn-primary btn-zine px-5 text-sm sm:inline-flex">
					Join free <ArrowUpRight class="size-4" />
				</a>
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
					{#if me}
						<a href={profileHref} class="flex items-center gap-4 card-zine card-zine-hover p-4">
							<Avatar userId={me.userId} icon={me.avatarIcon} hue={me.avatarHue} size={48} class="border-2 border-espresso" />
							<span class="min-w-0 flex-1">
								<span class="block truncate font-semibold">{me.name || 'Your profile'}</span>
								<span class="font-mono text-[11px] tracking-[0.08em] text-crema uppercase">
									Nº {me.memberNumber.toLocaleString('en-US')}{badge ? ` · ${badge.label}` : ''}
								</span>
							</span>
							{#if badge}<MemberBadge badge={badge.id} size="medal" label={false} class="w-14" />{/if}
						</a>
					{/if}
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<a href={profileHref} class="btn btn-primary btn-zine text-base">View your profile</a>
						<a href="/account" class="btn btn-zine bg-base-100 text-base"><Settings class="size-4" /> Account settings</a>
					</div>
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
