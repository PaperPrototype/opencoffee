<script lang="ts">
	import { ArrowRight, ArrowUpRight, BookOpen, Briefcase, CalendarDays, Check, HeartHandshake } from '@lucide/svelte';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';

	const me = $derived(page.data.me);

	const beliefs = [
		'Coffee can’t be mastered, so stop selling mastery.',
		'Coffee isn’t a slave, so stop trying to own it.',
		'We are its custodians: we work in harmony with it, and we grow together with it.',
		'And spend your life on the part that matters: the people.'
	];

	const model = [
		{
			icon: Briefcase,
			title: 'Careers + better workplaces',
			body: 'A Coffee CV, discovery and applications to start; career development and two-sided feedback next.',
			funds: 'Employer-paid job ads',
			href: '/jobs'
		},
		{
			icon: CalendarDays,
			title: 'Community + events',
			body: 'Discover and publish events with attendee and organizer tools. Free events stay $0.',
			funds: 'Paid ticketing, ~3–4% + a few cents, capped, all-in',
			href: '/events'
		},
		{
			icon: BookOpen,
			title: 'Education + creators',
			body: 'Free fundamentals and shared knowledge stay open. Creators sell their own courses and set their prices.',
			funds: '80% to course creators · 20% to SCC',
			href: '/learn'
		}
	];

	const agreement = [
		'Honesty about unfinished systems and unresolved decisions.',
		'Room for questions, correction and thoughtful disagreement.',
		'Self-forgiveness that leaves us able to learn and do better.',
		'Forgiveness for imperfection, never indifference to harm.',
		'Compassion towards people; accountability for what we build.'
	];

	const pledge = [
		'No membership fees.',
		'No paywalled shared community knowledge. Creators may sell their own courses.',
		'No selling member data.',
		'Transparent requests with open books, published monthly.',
		'Employer vacancy listings are paid; third-party display advertising is not the model.',
		'If the pledge is broken, the community gets the domain and database.'
	];

	const numbers = [
		{ value: '$5,000–$10,000', label: 'A full paid education pathway', note: 'A reference range from public course catalogues. Not a requirement for competence or belonging.' },
		{ value: '$1,992', label: 'One person’s all-in Expo trip', note: 'A personal cost accounting, not the price of every trip.' },
		{ value: '$10–15K', label: 'One barista competition season', note: 'Varies with travel, preparation, support and geography.' },
		{ value: '$14/hr', label: 'Average US barista wage', note: 'A US reference point, not a global benchmark.' }
	];

	const conduct = [
		'Assume good faith; take harm seriously.',
		'No harassment, hate or personal attacks.',
		'No snobbery.',
		'Disclose affiliations.',
		'Facts over flame wars; compassion over pile-ons.',
		'Producers are members, not content.',
		'Moderation in the open, with a public log and appeals.'
	];
</script>

<svelte:head>
	<title>Manifesto — Specialty Coffee Community</title>
	<meta
		name="description"
		content="Why Specialty Coffee Community exists: devotion to the people, free to join, open books, and a pledge the community can hold us to."
	/>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main>
	<section class="border-b-2 border-espresso">
		<div class="mx-auto max-w-[1100px] px-6 pt-14 pb-16">
			<p class="eyebrow">Why we exist · The SCC Manifesto</p>
			<h1 class="display mt-4 text-[48px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[80px]">
				Devotion to <span class="squiggle inline-block text-primary italic">the people.</span>
			</h1>
			<p class="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-roast md:text-lg">
				Coffee can’t be mastered. People shouldn’t be owned, ranked into silence or left to build a working life alone. We
				are custodians: community-driven, free to join, and here to leave coffee better for the people who come next.
			</p>
			<nav class="mt-8 flex flex-wrap gap-2" aria-label="On this page">
				{#each [['#model', 'The model'], ['#compassion', 'Compassion + forgiveness'], ['#pledge', 'The pledge'], ['#numbers', 'The numbers'], ['#conduct', 'Conduct']] as [href, label] (href)}
					<a {href} class="chip bg-base-100 px-3.5 py-1.5 transition-colors hover:bg-espresso hover:text-paper">{label}</a>
				{/each}
			</nav>
		</div>
	</section>

	<!-- Beliefs -->
	<section class="bg-neutral text-neutral-content">
		<div class="mx-auto max-w-[900px] px-6 py-24">
			<p class="eyebrow text-secondary">What we believe, in one breath</p>
			<ul class="mt-8 grid gap-5">
				{#each beliefs as line, i (line)}
					<li class="font-display text-[26px] leading-snug md:text-[34px] {i === beliefs.length - 1 ? 'text-primary italic' : ''}">{line}</li>
				{/each}
			</ul>
			<p class="mt-10 font-mono text-xs tracking-[0.14em] text-neutral-content/60 uppercase">
				Good coffee is for everyone · To seek the best coffee, for the benefit of all
			</p>
		</div>
	</section>

	<!-- Model -->
	<section id="model" class="mx-auto max-w-[1100px] scroll-mt-24 px-6 py-24">
		<p class="eyebrow">The model</p>
		<h2 class="mt-4 max-w-[24ch] text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">
			Three priorities. Three visible ways we pay for them.
		</h2>
		<div class="mt-12 grid gap-6 md:grid-cols-3">
			{#each model as item (item.title)}
				<a href={item.href} class="flex flex-col card-zine card-zine-hover p-7">
					<item.icon class="size-7 text-primary" strokeWidth={1.75} />
					<h3 class="mt-6 text-2xl font-medium">{item.title}</h3>
					<p class="mt-2 text-[15px] leading-relaxed text-roast">{item.body}</p>
					<p class="mt-6 border-t-2 border-line pt-4 font-mono text-[11px] tracking-[0.08em] text-crema uppercase">Funded by: {item.funds}</p>
				</a>
			{/each}
		</div>
	</section>

	<!-- Compassion -->
	<section id="compassion" class="scroll-mt-24 border-y-2 border-espresso bg-base-300 py-24">
		<div class="mx-auto grid max-w-[1100px] gap-12 px-6 lg:grid-cols-2">
			<div>
				<p class="eyebrow">Compassion + forgiveness · at our core</p>
				<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">Not perfection.</h2>
				<div class="mt-6 space-y-4 text-[16px] leading-relaxed text-roast">
					<p>
						We see value missing from coffee community and working life, and we want to help provide it with sustainable,
						low-cost systems for careers, connection, events and learning. We’re learning how as we go. We won’t always get
						it right, and we won’t pretend otherwise.
					</p>
					<p>
						Please meet genuine effort with compassion and forgiveness. Tell us what feels broken, missing or poorly
						considered. We’ll listen, correct what we can, apologise where needed and keep doing the work.
					</p>
				</div>
				<p class="mt-8 font-display text-xl leading-snug font-semibold">
					Lower your expectations of our perfection. <span class="text-primary italic">Never lower your expectations of our care.</span>
				</p>
			</div>
			<div class="card-zine p-7">
				<p class="flex items-center gap-2 font-semibold"><HeartHandshake class="size-5 text-primary" /> Our working agreement</p>
				<ul class="mt-5 grid gap-4">
					{#each agreement as item (item)}
						<li class="flex gap-3 text-[15px] leading-relaxed"><Check class="mt-1 size-4 shrink-0 text-primary" />{item}</li>
					{/each}
				</ul>
				<a href="/#contact" class="link-zine mt-6 text-sm">Tell us what needs care <ArrowRight class="size-4" /></a>
			</div>
		</div>
	</section>

	<!-- Pledge -->
	<section id="pledge" class="mx-auto max-w-[900px] scroll-mt-24 px-6 py-24">
		<p class="eyebrow">The Free-to-Join Pledge</p>
		<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">The promises are the product.</h2>
		<ol class="mt-10 card-zine divide-y-2 divide-line overflow-hidden">
			{#each pledge as item, i (item)}
				<li class="flex gap-5 px-7 py-5">
					<span class="font-mono text-sm text-primary">0{i + 1}</span>
					<span class="text-[17px] {i === pledge.length - 1 ? 'font-semibold' : ''}">{item}</span>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Numbers -->
	<section id="numbers" class="scroll-mt-24 border-y-2 border-espresso bg-base-100 py-24">
		<div class="mx-auto max-w-[1100px] px-6">
			<p class="eyebrow">The numbers</p>
			<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">Why this home needs to exist.</h2>
			<p class="mt-4 max-w-[60ch] text-roast">Reference points, not universal price tags. Their context matters more than their shock value.</p>
			<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each numbers as n (n.label)}
					<div class="border-t-2 border-espresso pt-5">
						<p class="font-display text-[34px] leading-none font-semibold text-primary">{n.value}</p>
						<p class="mt-3 font-semibold">{n.label}</p>
						<p class="mt-1 text-sm leading-relaxed text-roast">{n.note}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Conduct -->
	<section id="conduct" class="mx-auto max-w-[900px] scroll-mt-24 px-6 py-24">
		<p class="eyebrow">Conduct</p>
		<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">Be factual. Be compassionate.</h2>
		<p class="mt-4 text-roast">We cite, we don’t vilify. We make room to learn without making room for harm.</p>
		<ul class="mt-8 grid gap-3 sm:grid-cols-2">
			{#each conduct as item (item)}
				<li class="flex gap-3 text-[15px] leading-relaxed"><Check class="mt-1 size-4 shrink-0 text-primary" />{item}</li>
			{/each}
		</ul>
	</section>

	<section class="bg-neutral text-neutral-content">
		<div class="mx-auto max-w-[720px] px-6 py-24 text-center">
			<p class="eyebrow text-secondary">This is the invitation</p>
			<h2 class="display mt-5 text-[36px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[48px]">
				Bring compassion. <span class="text-primary italic">We’ll bring the work.</span>
			</h2>
			<div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
				{#if me}
					<a href="/members" class="btn h-14 btn-primary px-7 text-base">Meet the members <ArrowRight class="size-4" /></a>
				{:else}
					<a href="/auth?mode=signup" class="btn h-14 btn-primary px-7 text-base">Join free <ArrowUpRight class="size-4" /></a>
				{/if}
				<a href="/#contact" class="btn h-14 border-2 border-neutral-content bg-transparent px-7 text-base text-neutral-content hover:bg-neutral-content hover:text-neutral">
					Write to the founder
				</a>
			</div>
		</div>
	</section>
</main>

<SiteFooter />
