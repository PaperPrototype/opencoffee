<script lang="ts">
	import {
		ArrowRight,
		ArrowUpRight,
		BookOpen,
		Briefcase,
		CalendarDays,
		Check,
		Flame,
		GraduationCap,
		IdCard,
		MessagesSquare,
		Pin,
		Search,
		Send,
		Users
	} from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { badgeById, formatMemberNumber } from '#lib/badges.js';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import MemberBadge from '#lib/components/MemberBadge.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketCard from '#lib/components/TicketCard.svelte';
	import {
		exampleCv,
		festivals as demoFestivals,
		foundingClasses,
		goingAvatars,
		moreFestivals as demoMoreFestivals,
		pledges,
		threads,
		thisWeek as demoThisWeek
	} from '#lib/landing.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const me = $derived(page.data.me);
	/** The badge the next person to join gets; null once the 10,000 are gone. */
	const nextBadge = $derived(badgeById(data.members.next.badge));
	const nextRun = $derived(data.members.runs.find((r) => r.id === data.members.next.badge));
	let sending = $state(false);

	// Real events once there are any; the pre-launch demo otherwise (linked to /events, not to fake pages).
	const toEvents = <T extends object>(list: T[]) => list.map((e) => ({ ...e, href: '/events' }));
	const thisWeek = $derived(data.thisWeek.length ? data.thisWeek : toEvents(demoThisWeek));
	const weekCount = $derived(data.thisWeek.length ? data.weekCount : 64);
	const realFestivals = $derived(data.festivals.length > 0);
	const festivals = $derived(
		realFestivals ? data.festivals.map((f) => ({ ...f, href: `/event/${f.slug}` })) : demoFestivals.map((f) => ({ ...f, href: '/events?category=festival' }))
	);
	const moreFestivals = $derived(
		realFestivals
			? data.moreFestivals.map((f) => ({ label: f.label, href: `/event/${f.slug}` }))
			: demoMoreFestivals.map((label) => ({ label, href: '/events?category=festival' }))
	);

	/** Only sections that exist link anywhere; the rest say they're coming instead of bouncing you home. */
	const pillars = [
		{ icon: IdCard, title: 'Coffee CV', body: 'Your public profile for the whole industry.', href: '/members/example' },
		{ icon: CalendarDays, title: 'Events', body: 'Every throwdown, cupping & festival — one calendar.', href: '/events' },
		{ icon: Briefcase, title: 'Jobs', body: 'Coffee businesses hire here. Applying is free.', href: '/jobs' },
		{ icon: GraduationCap, title: 'Learn', body: 'Free fundamentals, skills badges & community courses.', href: '/learn' }
	];

	const community = [
		{ icon: CalendarDays, title: 'Events', body: 'Every coffee event on Earth, one calendar.', href: '/events', cta: 'Browse events' },
		{ icon: Users, title: 'Member directory', body: 'Find mentors, peers and people hiring near you.', href: '/members', cta: 'Meet the members' },
		{ icon: MessagesSquare, title: 'Discussions', body: 'Searchable, permanent threads. No Discord memory-hole.', href: null, cta: null },
		{ icon: BookOpen, title: 'Learn', body: 'Free fundamentals, skills assessments and community-taught courses.', href: '/learn', cta: 'See the education model' }
	];

	const status = {
		solved: { label: 'Solved', icon: Check, class: 'border-accent text-accent' },
		trending: { label: 'Trending', icon: Flame, class: 'border-ember text-ember' },
		new: { label: 'New', icon: Pin, class: 'border-secondary text-secondary' }
	};

</script>

<svelte:head>
	<title>Specialty Coffee Community — Free to Join</title>
	<meta
		name="description"
		content="Specialty Coffee Community — a free, community-driven platform for baristas, roasters, producers, and home brewers. Free to join. Open knowledge."
	/>
</svelte:head>

<div class="grain" aria-hidden="true"></div>

<SiteHeader />

<main>
	<!-- Hero: the Coffee CV is the reason to join; the example shows exactly what you get. -->
	<section class="mx-auto grid max-w-[1344px] items-center gap-14 px-6 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
		<div>
			<p class="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-roast uppercase">
				<span class="size-2.5 rounded-full bg-accent ring-4 ring-accent/20"></span>
				A professional home for coffee people
			</p>
			<h1 class="display mt-6 text-[48px] leading-[0.98] font-semibold tracking-[-0.035em] sm:text-[64px] lg:text-[80px]">
				Your coffee work <span class="text-primary italic">deserves to be recognised.</span>
			</h1>
			<p class="mt-7 max-w-[54ch] text-[17px] leading-relaxed text-roast md:text-lg">
				Build a public Coffee CV for your bar work, competition results, judging and coaching. Get found by
				community-minded employers, and stay for the people, events and learning that move coffee forward.
			</p>

			<div class="mt-9 flex flex-col gap-3 sm:flex-row">
				{#if me}
					<a href="/members/{me.memberNumber}" class="btn h-14 btn-primary btn-zine px-7 text-base">See your Coffee CV <ArrowRight class="size-4" /></a>
					<a href="/welcome" class="btn h-14 btn-zine bg-base-100 px-7 text-base">Edit your Coffee CV</a>
				{:else}
					<a href="/auth?mode=signup" class="btn h-14 btn-primary btn-zine px-7 text-base">Join free <ArrowUpRight class="size-4" /></a>
					<a href="/members/example" class="btn h-14 btn-zine bg-base-100 px-7 text-base">See an example Coffee CV <ArrowUpRight class="size-4" /></a>
				{/if}
			</div>
			<p class="mt-5 font-mono text-[11px] tracking-[0.1em] text-crema uppercase">
				Free to create · Free to be discovered · Free to apply
			</p>

			{#if !me && nextBadge && nextRun}
				<!-- Scarcity, stated plainly: the number you'd get and how many are left in your class. -->
				<a href="#founding" class="group mt-8 flex max-w-md items-center gap-4 border-t-2 border-line pt-6">
					<MemberBadge badge={nextBadge.id} size="medal" label={false} class="w-14" />
					<span class="text-sm leading-snug text-roast">
						Join now and you're <strong class="text-espresso">member {formatMemberNumber(data.members.next.number)}</strong> of
						<span class="italic">{nextBadge.title}</span>.
						<span class="mt-1 block font-mono text-[11px] tracking-[0.08em] text-primary uppercase group-hover:underline">
							{nextRun.left.toLocaleString('en-US')} {nextRun.left === 1 ? 'place' : 'places'} left →
						</span>
					</span>
				</a>
			{/if}
		</div>

		<!-- The example CV, tilted like a printed sheet; the whole card opens the full example. -->
		<div class="relative mx-auto w-full max-w-[560px]">
			<div class="absolute -inset-6 -z-10 rounded-full border border-primary/25" aria-hidden="true"></div>
			<img src="/img/stamp-free-to-join.svg" alt="" class="absolute -bottom-10 -left-8 z-10 hidden size-24 animate-[spin_30s_linear_infinite] sm:block" />
			<!-- Below lg the sheet is cropped with a fade so the page doesn't become one long CV. -->
			<a
				href="/members/example"
				class="relative block rotate-[1.5deg] transition-transform duration-300 hover:rotate-0 max-lg:max-h-[520px] max-lg:overflow-hidden max-lg:p-2"
				aria-label="Open the example Coffee CV"
			>
				<CoffeeCv {...exampleCv} experience={exampleCv.experience.slice(0, 2)} strip={['Public Coffee CV', 'Example profile']} />
				<span class="absolute inset-x-0 bottom-0 flex h-32 items-end justify-center bg-linear-to-t from-base-200 via-base-200/90 to-transparent pb-4 lg:hidden">
					<span class="link-zine text-sm">See the full example <ArrowRight class="size-4" /></span>
				</span>
			</a>
		</div>
	</section>

	<!-- Four pillars -->
	<section class="border-y-2 border-espresso bg-base-100">
		<div class="grid grid-cols-2 lg:grid-cols-4">
			{#each pillars as pillar, i (pillar.title)}
				<svelte:element
					this={pillar.href ? 'a' : 'div'}
					href={pillar.href}
					class="group flex flex-col gap-2 p-5 md:px-16 md:py-7 lg:px-16 {pillar.href ? 'transition-colors hover:bg-base-300' : ''}
						{i % 2 === 1 ? 'border-l-2 border-espresso' : ''}
						{i === 2 ? 'border-t-2 border-espresso lg:border-t-0 lg:border-l-2' : ''}
						{i === 3 ? 'border-t-2 lg:border-t-0' : ''}"
				>
					<div class="flex items-center justify-between">
						<pillar.icon class="size-5 text-primary" />
						{#if pillar.href}
							<ArrowRight class="size-4 text-roast transition-transform group-hover:translate-x-1" />
						{:else}
							<span class="font-mono text-[10px] tracking-[0.12em] text-crema uppercase">Opening soon</span>
						{/if}
					</div>
					<span class="mt-2 font-display text-[19px] font-semibold tracking-tight">{pillar.title}</span>
					<span class="text-[13px] leading-snug text-roast">{pillar.body}</span>
				</svelte:element>
			{/each}
		</div>
	</section>

	<!-- Founding classes: the actual medals, live progress, and the number you'd get. -->
	<section id="founding" class="scroll-mt-24 border-b-2 border-espresso bg-base-100 py-24">
		<div class="mx-auto max-w-[1200px] px-6">
			<div class="mx-auto max-w-[720px] text-center">
				<p class="eyebrow">Founding classes</p>
				<h2 class="mt-4 text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[48px]">
					Three classes. <span class="text-primary italic"><span class="squiggle">All permanent.</span></span>
				</h2>
				<p class="mt-5 text-[17px] leading-relaxed text-roast">
					Your member number is set the moment you join and is never reissued. Join early enough and your Coffee CV
					carries one of these for good.
				</p>
			</div>

			<div class="mt-16 grid gap-14 md:grid-cols-3 md:gap-8">
				{#each data.members.runs as run, i (run.id)}
					{@const now = run.id === data.members.next.badge}
					<article class="flex flex-col items-center text-center">
						<span class="chip mb-5 {now ? 'border-primary bg-primary text-primary-content' : run.left === 0 ? 'bg-base-300 text-crema' : 'bg-base-100 text-crema'}">
							{now ? 'Claiming now' : run.left === 0 ? 'Closed · all claimed' : `Opens at ${formatMemberNumber(run.from)}`}
						</span>
						<MemberBadge badge={run.id} size="medal" class="w-full max-w-[300px]" />
						<h3 class="mt-6 font-display text-2xl font-medium italic">{run.title}</h3>
						<p class="mt-1 font-mono text-xs tracking-[0.08em] text-crema uppercase">
							Members {formatMemberNumber(run.from)}–{formatMemberNumber(run.limit)}
						</p>
						<div
							class="mt-4 h-2.5 w-full max-w-[260px] overflow-hidden rounded-full border-[1.5px] border-espresso bg-base-200"
							role="progressbar"
							aria-label="{run.title}: places claimed"
							aria-valuenow={run.claimed}
							aria-valuemin={0}
							aria-valuemax={run.size}
						>
							<!-- At least a sliver once anyone has claimed one, so 1 of 10,000 still shows. -->
							<div class="h-full" style:background={run.ink} style:width="{run.claimed ? Math.max(2, (run.claimed / run.size) * 100) : 0}%"></div>
						</div>
						<p class="mt-2 font-mono text-[11px] tracking-[0.08em] uppercase">
							<span class="font-semibold">{run.claimed.toLocaleString('en-US')}</span> of {run.size.toLocaleString('en-US')} claimed
							{#if run.left > 0}<span class="text-primary"> · {run.left.toLocaleString('en-US')} left</span>{/if}
						</p>
						<p class="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-roast">{foundingClasses[i]?.blurb}</p>
					</article>
				{/each}
			</div>

			<div class="mt-16 flex flex-col items-center gap-4 text-center">
				{#if me}
					<a href="/members/{me.memberNumber}" class="btn h-14 btn-primary btn-zine px-7 text-base">
						See your badge on your profile <ArrowRight class="size-4" />
					</a>
				{:else if nextBadge}
					<a href="/auth?mode=signup" class="btn h-14 btn-primary btn-zine px-7 text-base">
						Claim {formatMemberNumber(data.members.next.number)} — join free <ArrowUpRight class="size-4" />
					</a>
					<a href="/members/example" class="link-zine text-sm">See a badge on an example Coffee CV <ArrowRight class="size-4" /></a>
				{:else}
					<a href="/auth?mode=signup" class="btn h-14 btn-primary btn-zine px-7 text-base">Join free <ArrowUpRight class="size-4" /></a>
				{/if}
				<p class="mt-2 font-display text-lg font-semibold italic">No badge ever expires. No number is ever reissued.</p>
			</div>
		</div>
	</section>

	<!-- Happening this week -->
	<section class="border-b-2 border-espresso bg-base-300 py-20">
		<div class="mx-auto max-w-[1344px] px-8">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">Happening this week</p>
					<h3 class="mt-4 text-[26px] leading-[1.15] font-medium tracking-[-0.01em] md:text-[32px]">
						Don't miss these.
					</h3>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<form class="flex items-center card-zine shadow-zine-sm" action="/events" method="GET" role="search">
						<label class="flex items-center">
							<span class="sr-only">Search events</span>
							<input
								type="search"
								name="q"
								placeholder="Throwdown, cupping, city…"
								class="input h-11 w-56 border-0 bg-transparent px-4 text-[15px] placeholder:text-crema focus:outline-none"
							/>
						</label>
						<button type="submit" class="flex h-11 items-center px-4 hover:text-primary" aria-label="Search events"><Search class="size-4" /></button>
					</form>
					<a href="/events?when=week" class="link-zine">See all {weekCount} this week <ArrowRight class="size-4" /></a>
				</div>
			</div>
		</div>
		<div
			class="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-8 px-8 pb-4 [scrollbar-width:none] min-[1344px]:scroll-px-[calc((100vw-1280px)/2)] min-[1344px]:px-[calc((100vw-1280px)/2)]"
		>
			{#each thisWeek as event (event.slug)}
				<TicketCard {event} layout="row" class="w-[340px] shrink-0 snap-start sm:w-[560px]" />
			{/each}
		</div>
	</section>

	<!-- The big ones -->
	<section class="mx-auto max-w-[1100px] px-6 py-24">
		<p class="eyebrow">The big ones</p>
		<h2 class="mt-5 max-w-[16ch] text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[44px]">
			Festivals worth booking a flight for.
		</h2>
		<p class="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-roast">
			The world's major coffee festivals, ticketed here — with all-in prices and instant payout to
			organizers. No gateway skim.
		</p>

		<div class="mt-12 grid gap-6 md:grid-cols-3">
			{#each festivals as fest (fest.title)}
				<article class="card-zine card-zine-hover flex flex-col overflow-hidden">
					<img src={fest.image} alt={fest.title} loading="lazy" class="aspect-[16/9] w-full border-b-2 border-espresso object-cover" />
					<div class="flex flex-1 flex-col p-6">
						<p class="font-mono text-xs tracking-[0.14em] text-primary uppercase">{fest.where}</p>
						<h3 class="mt-2.5 text-2xl leading-[1.2] font-medium tracking-[-0.01em]">{fest.title}</h3>
						<p class="mt-2 text-[14.5px] leading-relaxed text-roast">{fest.blurb}</p>
						<div class="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm font-semibold">
							{fest.price}
							<span class="chip border-accent text-[10px] font-semibold text-accent">All-in · no checkout fees</span>
						</div>
						<div class="mt-4 flex items-center">
							{#if !realFestivals}
								<div class="mr-2 flex -space-x-2">
									{#each goingAvatars as src (src)}
										<img {src} alt="" class="size-8 rounded-full border-2 border-paper object-cover" />
									{/each}
								</div>
							{/if}
							<span class="chip bg-base-100 whitespace-nowrap"><Users class="size-3 text-primary" /> {fest.going} going</span>
						</div>
						<div class="mt-auto flex items-center justify-end gap-3 border-t-2 border-line pt-4">
							<a href={fest.href} class="btn btn-primary btn-zine text-sm">{realFestivals ? 'Get tickets' : 'Browse festivals'} <ArrowRight class="size-4" /></a>
						</div>
					</div>
				</article>
			{/each}
		</div>

		<div class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2">
			{#each moreFestivals as fest (fest.label)}
				<a href={fest.href} class="font-mono text-xs tracking-[0.14em] text-crema uppercase transition-colors hover:text-primary">{fest.label}</a>
			{/each}
		</div>
	</section>

	<!-- For organizers -->
	<section class="relative bg-neutral text-neutral-content">
		<div class="relative mx-auto max-w-[900px] px-6 py-32 text-center">
			<img
				src="/img/stamp-one-small-fee.svg"
				alt=""
				class="absolute top-20 left-6 hidden size-24 animate-[spin_24s_linear_infinite] opacity-80 invert md:block"
			/>
			<p class="eyebrow text-secondary">For event organizers</p>
			<h2 class="display mt-6 text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[52px]">
				Running a coffee event?<br />
				<span class="text-primary italic">Stop paying the skim.</span>
			</h2>
			<p class="mx-auto mt-6 max-w-[58ch] text-[17px] leading-relaxed text-neutral-content/80">
				Eventbrite takes about <strong class="text-neutral-content">$2.16 of a $10 ticket</strong> in fees,
				holds your money until after the event, and keeps 20% in reserve. Listing and ticketing with us
				costs <strong class="text-neutral-content">one small fee — ~3–4% plus a few cents, capped, all-in</strong>
				— from the very first ticket. Instant payouts. Your attendee data stays yours.
			</p>
			<div class="mt-10 flex flex-col items-center gap-3 font-mono text-[13px] tracking-[0.1em] uppercase">
				<span class="rounded-[10px] border border-neutral-content/20 bg-neutral-content/5 px-5 py-2.5">
					Eventbrite on a $10 ticket: <span class="text-ember">~$2.37 gone</span>
				</span>
				<span class="rounded-[10px] border-2 border-accent bg-accent/15 px-5 py-2.5 font-semibold text-secondary">
					Us: ~$0.65 on a $10 ticket
				</span>
			</div>
			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a href="/host" class="btn btn-primary text-[15px]">List your event — free</a>
				<a href="/host" class="btn border-2 border-neutral-content bg-transparent text-[15px] text-neutral-content hover:bg-neutral-content hover:text-neutral">
					See how hosting works →
				</a>
			</div>
		</div>
	</section>

	<!-- More than events -->
	<section class="mx-auto max-w-[1100px] px-6 py-28">
		<p class="eyebrow">More than events</p>
		<h2 class="mt-5 max-w-[20ch] text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[44px]">
			The calendar brings you in. The community keeps you.
		</h2>
		<p class="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-roast">
			Free to join, community-driven, open knowledge — the events just gave us a reason to finally
			gather in one place.
		</p>
		<div class="mt-12 grid gap-6 sm:grid-cols-2">
			{#each community as item (item.title)}
				<svelte:element this={item.href ? 'a' : 'div'} href={item.href} class="card-zine flex flex-col p-7 {item.href ? 'card-zine-hover' : 'bg-base-200'}">
					<item.icon class="size-7 text-primary" strokeWidth={1.75} />
					<h3 class="mt-6 text-[28px] leading-tight font-medium tracking-[-0.01em]">{item.title}</h3>
					<p class="mt-3 text-[15px] leading-relaxed text-roast">{item.body}</p>
					{#if item.cta}
						<span class="link-zine mt-6 self-start text-[15px]">{item.cta} <ArrowRight class="size-4" /></span>
					{:else}
						<p class="mt-6 font-mono text-xs tracking-[0.14em] text-crema uppercase">Opening soon</p>
					{/if}
				</svelte:element>
			{/each}
		</div>
	</section>

	<!-- Forum -->
	<section class="border-y border-line bg-base-300 py-28">
		<div class="mx-auto max-w-[1100px] px-6">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">A preview of the forum</p>
					<h2 class="mt-5 text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[44px]">
						The kettle is always on.
					</h2>
				</div>
				<span class="chip bg-base-100">Opening soon</span>
			</div>

			<ul class="mt-10 card-zine divide-y-2 divide-line overflow-hidden">
				{#each threads as thread (thread.title)}
					{@const s = status[thread.status]}
					<li>
						<div class="flex items-center gap-4 px-7 py-5">
							<span class="chip hidden shrink-0 bg-base-100 text-[11px] md:inline-flex">
								<span class="size-2 rounded-full {thread.dot}"></span>{thread.category}
							</span>
							<div class="min-w-0 flex-1">
								<p class="text-[19px] leading-snug font-semibold">{thread.title}</p>
								<p class="mt-1 flex items-center gap-2 text-sm text-roast">
									<img src={thread.avatar} alt="" class="size-6 rounded-full border border-line" />
									{thread.author} <span class="opacity-50">·</span>
									<span class="font-mono text-[13px] text-crema">{thread.replies} replies</span>
								</p>
							</div>
							<span class="chip hidden shrink-0 bg-transparent text-[10px] sm:inline-flex {s.class}">
								<s.icon class="size-3" />{s.label}
							</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<div class="border-b border-line py-10">
		<ul class="flex flex-wrap justify-center gap-x-8 gap-y-2 font-mono text-xs tracking-[0.16em] uppercase">
			{#each pledges as pledge (pledge)}
				<li class="flex items-center gap-2"><Check class="size-4 text-primary" />{pledge}</li>
			{/each}
		</ul>
	</div>

	<!-- Founder + contact -->
	<section class="mx-auto grid max-w-[1344px] items-start gap-12 px-8 py-28 lg:grid-cols-2">
		<div>
			<p class="eyebrow">About the founder</p>
			<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[40px]">
				Built by a coffee person, <span class="squiggle text-primary italic">for</span> coffee people.
			</h2>
			<div class="mt-8 flex items-center gap-4">
				<img
					src="/img/founder-portrait.webp"
					alt="The founder"
					class="size-20 rounded-full border-2 border-espresso object-cover shadow-zine-sm"
				/>
				<div>
					<p class="font-semibold">The Founder</p>
					<p class="font-mono text-[11px] tracking-[0.14em] text-crema uppercase">
						Specialty coffee professional · Started this in 2026
					</p>
				</div>
			</div>
			<div class="mt-8 max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-roast">
				<p>
					This project started with a simple frustration: the people who make specialty coffee what it is
					— baristas, roasters, trainers, producers, café owners — keep paying tolls to organizations that
					are supposed to serve them. Membership fees that buy little. Course materials locked behind
					invoices. And every local throwdown ticketed on a platform that skims fees out of the industry it
					has no stake in.
				</p>
				<p>
					So I bought the domain and started building the alternative: a community-driven home where
					education is free, events are ticketed fairly, jobs reach the right people, and every member gets
					a public coffee CV they're proud to share. The fees the industry was leaking? They should stay in
					the industry — funding the community, not extracting from it.
				</p>
				<p class="font-semibold text-espresso">It's free to join — and that's the whole point. — The Founder</p>
			</div>
		</div>

		<form
			id="contact"
			class="card-zine p-8 shadow-zine-lg"
			method="POST"
			action="?/contact"
			use:enhance={() => {
				sending = true;
				return async ({ update }) => {
					await update({ reset: false, invalidateAll: false });
					sending = false;
				};
			}}
		>
			<p class="eyebrow">Say hello</p>
			<h3 class="mt-4 text-2xl font-medium">Contact the founder</h3>
			<p class="mt-3 text-sm text-roast">
				Feedback, ideas, partnerships, press — or you just want to talk coffee. Every message is read.
			</p>
			<fieldset class="fieldset mt-4 gap-1">
				<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="c-name">Your name</label>
				<input id="c-name" name="name" autocomplete="name" class="input h-14 w-full field-zine" placeholder="Maya Reyes" value={form?.name ?? ''} />
				<label class="fieldset-legend mt-3 font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="c-email">Your email</label>
				<input id="c-email" name="email" type="email" required autocomplete="email" class="input h-14 w-full field-zine" placeholder="maya@example.com" value={form?.email ?? ''} />
				<label class="fieldset-legend mt-3 font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="c-msg">Message</label>
				<textarea id="c-msg" name="message" required class="textarea h-36 w-full field-zine" placeholder="Tell me what's on your mind…" value={form?.body ?? ''}></textarea>
				<input type="text" name="company" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
			</fieldset>
			{#if form && 'sent' in form}
				<p role="status" class="mt-6 flex items-center gap-2 rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
					<Check class="size-4" /> Sent. The founder will reply to the email you gave.
				</p>
			{:else}
				{#if form?.contactError}<p role="alert" class="mt-4 text-sm text-error">{form.contactError}</p>{/if}
				<button type="submit" disabled={sending} class="btn mt-6 h-14 w-full btn-primary btn-zine text-[15px]">
					{sending ? 'Sending…' : 'Send to the founder'} <Send class="size-4" />
				</button>
			{/if}
		</form>
	</section>

	<!-- WEC cross-promo -->
	<section class="border-t-2 border-espresso py-24 text-center">
		<div class="mx-auto max-w-[860px] px-6">
			<p class="eyebrow">World Espresso Championship</p>
			<h2 class="mt-5 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] uppercase md:text-[44px]">
				The championship that runs on the record
			</h2>
			<p class="mx-auto mt-6 max-w-[66ch] text-[15px] leading-relaxed text-roast">
				Every score, every competitor, published live. Blind ISO 5495 judging. Tokyo, 2 May 2027 — the day
				after the World Barista Championship final. Ready to run the moment it's funded.
			</p>
			<a href="https://worldespressochampionship.com" class="btn mt-8 h-14 btn-primary btn-zine px-7 text-[15px]">
				See the championship plan →
			</a>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="bg-neutral text-neutral-content">
		<div class="mx-auto max-w-[760px] px-6 pt-36 pb-28 text-center">
			<img src="/img/stamp-free-to-join.svg" alt="" class="mx-auto size-24 animate-[spin_30s_linear_infinite]" />
			<h2 class="display mt-20 text-[48px] leading-none font-semibold tracking-[-0.025em] md:text-[64px]">
				Free to join. <span class="text-primary italic">Full stop.</span>
			</h2>
			<p class="mx-auto mt-10 max-w-[56ch] text-[17px] leading-relaxed text-neutral-content/80">
				Free to join. Free to learn. Free to list your event — paid tickets carry one small, capped fee,
				free events stay free. No trials, no tiers, no 'premium' — bring your questions, especially the
				dumb ones.
			</p>
			<form class="mx-auto mt-10 flex max-w-[444px] flex-col gap-4 sm:flex-row" method="GET" action="/auth">
				<input type="hidden" name="mode" value="signup" />
				<label class="sr-only" for="join-email">Email</label>
				<input
					id="join-email"
					name="email"
					type="email"
					placeholder="you@coffeeplace.com"
					class="input h-[52px] flex-1 border-0 text-base-content placeholder:text-crema"
				/>
				<button type="submit" class="btn h-[52px] btn-primary px-6 text-[15px]">Join free</button>
			</form>
			<ul class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 font-mono text-xs tracking-[0.16em] uppercase">
				{#each pledges as pledge (pledge)}
					<li class="flex items-center gap-2"><Check class="size-4 text-primary" />{pledge}</li>
				{/each}
			</ul>
			<p class="mt-8 font-mono text-xs text-neutral-content/50">
				{data.members.total.toLocaleString('en-US')} {data.members.total === 1 ? 'member' : 'members'} so far · join in 20 seconds · no card, obviously
			</p>
		</div>
	</section>
</main>

<SiteFooter />
