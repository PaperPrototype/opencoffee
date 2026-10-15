<script lang="ts">
	import {
		ArrowRight,
		BookOpen,
		Briefcase,
		CalendarDays,
		Check,
		ChevronRight,
		Flame,
		GraduationCap,
		IdCard,
		MapPin,
		MessagesSquare,
		Pin,
		Search,
		Send,
		Users
	} from '@lucide/svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import TicketCard from '#lib/components/TicketCard.svelte';
	import {
		festivals as demoFestivals,
		foundingClasses,
		goingAvatars,
		heroStack as demoHeroStack,
		moreFestivals as demoMoreFestivals,
		pledges,
		threads,
		thisWeek as demoThisWeek
	} from '#lib/landing.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Real events once there are any; the pre-launch demo otherwise (linked to /events, not to fake pages).
	const toEvents = <T extends object>(list: T[]) => list.map((e) => ({ ...e, href: '/events' }));
	const heroStack = $derived(data.heroStack.length === 3 ? data.heroStack : toEvents(demoHeroStack));
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

	const quickFilters = ['Throwdowns', 'Free cuppings', 'This weekend', 'Festivals 2026', 'London', 'Tokyo'];

	const pillars = [
		{ icon: CalendarDays, title: 'Events', body: 'Every throwdown, cupping & festival — one calendar.' },
		{ icon: Briefcase, title: 'Jobs', body: 'Coffee businesses hire here. Applying is free.' },
		{ icon: GraduationCap, title: 'Knowledge', body: 'Free guides, paths & certificates. Open knowledge.' },
		{ icon: IdCard, title: 'Coffee CV', body: 'Your public profile for the whole industry.' }
	];

	const community = [
		{ icon: MessagesSquare, title: 'Discussions', body: 'Searchable, permanent threads. No Discord memory-hole.', stat: '3,217 threads' },
		{ icon: BookOpen, title: 'Knowledge Base', body: 'Free, curated guides from espresso to green buying.', stat: '186 guides' },
		{ icon: CalendarDays, title: 'Events', body: 'Every coffee event on Earth, one calendar.', stat: '312 listed · 58% free' },
		{ icon: Briefcase, title: 'Careers', body: 'Salary transparency and real career maps.', stat: '412 salary reports' }
	];

	const status = {
		solved: { label: 'Solved', icon: Check, class: 'border-accent text-accent' },
		trending: { label: 'Trending', icon: Flame, class: 'border-ember text-ember' },
		new: { label: 'New', icon: Pin, class: 'border-secondary text-secondary' }
	};

	// Back card, middle card, front card — fanned out like a hand of tickets.
	const fan = [
		'-translate-x-[calc(50%+40px)] -translate-y-[calc(50%+46px)] rotate-5 z-10',
		'-translate-x-1/2 -translate-y-1/2 z-[11]',
		'-translate-x-[calc(50%-40px)] -translate-y-[calc(50%-46px)] -rotate-5 z-[12]'
	];
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
	<!-- Hero -->
	<section class="mx-auto grid max-w-[1344px] items-center gap-10 px-8 pt-16 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
		<div>
			<p class="eyebrow">Specialty Coffee Community</p>
			<p class="mt-3 font-mono text-[13px] font-semibold tracking-[0.18em] uppercase md:text-[15px]">
				Events<span class="text-primary">.</span> Jobs<span class="text-primary">.</span> Knowledge<span
					class="text-primary">.</span
				> <span class="text-primary">Free to join.</span>
			</p>
			<h1
				class="display mt-4 text-[52px] leading-[1.15] font-semibold tracking-[-0.025em] sm:text-[68px] lg:text-[84px] lg:leading-[1.36]"
			>
				Find your coffee people. <span class="squiggle inline-block text-primary italic">Near you.</span>
			</h1>
			<p class="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-roast md:text-lg">
				Throwdowns, cuppings, festivals, and workshops in 41 countries — finally in one place. Free to
				browse, free to list. Paid tickets carry one small fee — free events stay free.
			</p>

			<form
				class="mt-9 flex max-w-[672px] flex-col card-zine shadow-zine sm:flex-row sm:items-center"
				action="/events"
				method="GET"
			>
				<label class="flex flex-1 items-center">
					<span class="sr-only">Search events</span>
					<input
						type="search"
						name="q"
						placeholder="Search events, cities, organizers… try 'throwdown'"
						class="input h-12 w-full border-0 bg-transparent px-5 text-[15px] placeholder:text-crema focus:outline-none"
					/>
				</label>
				<div class="my-3 hidden w-0.5 self-stretch bg-line sm:block"></div>
				<button
					type="button"
					class="flex h-12 items-center gap-2 px-5 font-mono text-[13px] whitespace-nowrap transition-colors hover:text-primary"
				>
					<MapPin class="size-4 text-primary" /> Portland, OR ▾
				</button>
				<button type="submit" class="btn m-3 h-12 btn-primary btn-zine px-[26px] text-[15px] sm:m-2">
					<Search class="size-4" /> Find events
				</button>
			</form>

			<p class="mt-3.5 flex flex-wrap items-center gap-1.5 px-1 font-mono text-[13px] text-crema uppercase">
				<Check class="size-3.5" /> Showing events near Portland, OR — not right?
				<button class="font-semibold text-espresso underline decoration-primary decoration-2 underline-offset-4 hover:text-primary">
					Change
				</button>
			</p>

			<div class="mt-6 flex flex-wrap gap-2">
				{#each quickFilters as filter (filter)}
					<a href="/" class="chip bg-base-100 px-3.5 py-1.5 transition-colors hover:bg-espresso hover:text-paper">{filter}</a>
				{/each}
			</div>

			<p class="mt-8 flex items-center gap-2 font-mono text-[13px] text-crema">
				<CalendarDays class="size-4 text-primary" /> {weekCount} {weekCount === 1 ? 'event' : 'events'} this week worldwide
			</p>
		</div>

		<div class="relative hidden h-[700px] lg:block">
			<img
				src="/img/stamp-one-small-fee.svg"
				alt=""
				class="absolute top-[44%] left-[2%] z-20 size-28 animate-[spin_24s_linear_infinite]"
			/>
			{#each heroStack as event, i (event.slug)}
				<div class="absolute top-1/2 left-1/2 w-[380px] {fan[i]}">
					<TicketCard {event} />
				</div>
			{/each}
			<p
				class="absolute inset-x-0 bottom-0 text-center font-mono text-xs tracking-[0.1em] text-crema uppercase"
			>
				Live from the community calendar
			</p>
		</div>
	</section>

	<!-- Four pillars -->
	<section class="border-y-2 border-espresso bg-base-100">
		<div class="grid grid-cols-2 lg:grid-cols-4">
			{#each pillars as pillar, i (pillar.title)}
				<a
					href={pillar.title === 'Events' ? '/events' : '/'}
					class="group flex flex-col gap-2 p-5 transition-colors hover:bg-base-300 md:px-16 md:py-7 lg:px-16
						{i % 2 === 1 ? 'border-l-2 border-espresso' : ''}
						{i === 2 ? 'border-t-2 border-espresso lg:border-t-0 lg:border-l-2' : ''}
						{i === 3 ? 'border-t-2 lg:border-t-0' : ''}"
				>
					<div class="flex items-center justify-between">
						<pillar.icon class="size-5 text-primary" />
						<ArrowRight class="size-4 text-roast transition-transform group-hover:translate-x-1" />
					</div>
					<span class="mt-2 font-display text-[19px] font-semibold tracking-tight">{pillar.title}</span>
					<span class="text-[13px] leading-snug text-roast">{pillar.body}</span>
				</a>
			{/each}
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
				<div class="flex items-center gap-6">
					<span
						class="hidden items-center gap-2 rounded-full border-2 border-espresso bg-base-100 px-4 py-2 font-mono text-xs tracking-[0.08em] uppercase md:inline-flex"
					>
						<MapPin class="size-4 text-primary" /> Near Portland, OR
					</span>
					<a href="/events?when=week" class="link-zine">All {weekCount} this week <ArrowRight class="size-4" /></a>
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
						<div class="mt-auto flex items-center justify-between gap-3 border-t-2 border-line pt-4">
							<a href={fest.href} class="link-zine text-sm">Details <ArrowRight class="size-4" /></a>
							<a href={fest.href} class="btn btn-primary btn-zine text-sm">Get tickets</a>
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
				<a href="/" class="btn border-2 border-neutral-content bg-transparent text-[15px] text-neutral-content hover:bg-neutral-content hover:text-neutral">
					See the ticketing math →
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
				<a href="/" class="card-zine card-zine-hover flex flex-col p-7">
					<item.icon class="size-7 text-primary" strokeWidth={1.75} />
					<h3 class="mt-6 text-[28px] leading-tight font-medium tracking-[-0.01em]">{item.title}</h3>
					<p class="mt-3 text-[15px] leading-relaxed text-roast">{item.body}</p>
					<p class="mt-6 font-mono text-xs tracking-[0.14em] text-crema uppercase">{item.stat}</p>
					<span class="link-zine mt-3 self-start text-[15px]">Explore <ArrowRight class="size-4" /></span>
				</a>
			{/each}
		</div>
	</section>

	<!-- Forum -->
	<section class="border-y border-line bg-base-300 py-28">
		<div class="mx-auto max-w-[1100px] px-6">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">Live from the forum</p>
					<h2 class="mt-5 text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[44px]">
						The kettle is always on.
					</h2>
				</div>
				<a href="/" class="link-zine">All discussions <ArrowRight class="size-4" /></a>
			</div>

			<ul class="mt-10 card-zine divide-y-2 divide-line overflow-hidden">
				{#each threads as thread (thread.title)}
					{@const s = status[thread.status]}
					<li>
						<a href="/" class="flex items-center gap-4 px-7 py-5 transition-colors hover:bg-base-200">
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
							<ChevronRight class="size-5 shrink-0 text-roast" />
						</a>
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

		<form class="card-zine p-8 shadow-zine-lg" onsubmit={(e) => e.preventDefault()}>
			<p class="eyebrow">Say hello</p>
			<h3 class="mt-4 text-2xl font-medium">Contact the founder</h3>
			<p class="mt-3 text-sm text-roast">
				Feedback, ideas, partnerships, press — or you just want to talk coffee. Every message is read.
			</p>
			<fieldset class="fieldset mt-4 gap-1">
				<label class="fieldset-legend font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="c-name">Your name</label>
				<input id="c-name" class="input h-14 w-full field-zine" placeholder="Maya Reyes" />
				<label class="fieldset-legend mt-3 font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="c-email">Your email</label>
				<input id="c-email" type="email" class="input h-14 w-full field-zine" placeholder="maya@example.com" />
				<label class="fieldset-legend mt-3 font-mono text-[11px] font-normal tracking-[0.14em] text-crema uppercase" for="c-msg">Message</label>
				<textarea id="c-msg" class="textarea h-36 w-full field-zine" placeholder="Tell me what's on your mind…"></textarea>
			</fieldset>
			<button type="submit" class="btn mt-6 h-14 w-full btn-primary btn-zine text-[15px]">
				Send message <Send class="size-4" />
			</button>
		</form>
	</section>

	<!-- Founding classes -->
	<section class="border-t-2 border-espresso bg-base-100 py-24">
		<div class="mx-auto max-w-[880px] px-6">
			<p class="eyebrow">Founding classes</p>
			<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">
				Three classes. <span class="text-primary italic"><span class="squiggle">All permanent.</span></span>
			</h2>
			<div class="mt-10 space-y-10">
				{#each foundingClasses as cls (cls.name)}
					<div class="border-2 border-espresso bg-base-200 p-8">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<h3 class="text-[26px] font-semibold tracking-[-0.01em] uppercase">{cls.name}</h3>
							<p class="font-mono text-xs tracking-[0.14em] uppercase">0 of {cls.places} places claimed</p>
						</div>
						<p class="mt-3 text-[15px] text-roast">{cls.blurb}</p>
						<progress class="progress mt-5 h-3 w-full rounded-none border-2 border-espresso bg-base-100 text-primary" value="0" max="100"></progress>
					</div>
				{/each}
			</div>
			<p class="mt-12 text-center font-mono text-xs tracking-[0.14em] text-crema uppercase">
				Community-driven · Free to join
			</p>
			<p class="mt-3 text-center font-display text-lg font-semibold italic">
				Every class is permanent. No badge ever expires.
			</p>
		</div>
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
				worldespressochampionship.com →
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
				12,483 members · 312 events listed · join in 20 seconds · no card, obviously
			</p>
		</div>
	</section>
</main>

<SiteFooter />
