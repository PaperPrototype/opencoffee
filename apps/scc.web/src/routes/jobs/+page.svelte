<script lang="ts">
	import { ArrowRight, ArrowUpRight, BadgeCheck, Briefcase, Eye, IdCard, Lock, Mail, MapPin, Scale, Send, ShieldCheck, Users } from '@lucide/svelte';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';

	const me = $derived(page.data.me);

	const steps = [
		{ icon: IdCard, title: 'Make your Coffee CV', body: 'Roles, skills and where you have worked. About four minutes, free forever.' },
		{ icon: BadgeCheck, title: 'Say you’re open', body: 'Set “Looking for work” or “Open to the right role”. Switch it off any time.' },
		{ icon: Send, title: 'Apply free', body: 'When listings open, apply with your CV in one click. Applying never costs you anything.' }
	];

	/** Illustrative listings: the shape of the board, not live vacancies. */
	const examples = [
		{ title: 'Head barista', employer: 'Neighbourhood café', where: 'Melbourne, AU', type: 'Full time', pay: 'A$32–36/hr' },
		{ title: 'Production roaster', employer: 'Specialty roastery', where: 'Portland, US', type: 'Full time', pay: '$24–28/hr' },
		{ title: 'Weekend barista', employer: 'Coffee bar', where: 'London, UK', type: 'Part time', pay: '£13.50/hr' },
		{ title: 'Green coffee QC', employer: 'Importer', where: 'Remote · origin trips', type: 'Contract', pay: 'Day rate' }
	];

	const prices = [
		{ group: 'Group 1', price: '$20' },
		{ group: 'Group 2', price: '$40' },
		{ group: 'Group 3', price: '$90' },
		{ group: 'Group 4', price: '$150' },
		{ group: 'Group 5', price: '$240' }
	];

	const safeguards = [
		{ icon: Lock, title: 'Private by default', body: 'Detailed feedback after a role stays private, so both sides can be specific and useful.' },
		{ icon: Eye, title: 'You choose what’s public', body: 'Which roles, skills and milestones show on your Coffee CV is your call.' },
		{ icon: Scale, title: 'Patterns, not pile-ons', body: 'One accusation never becomes a public verdict. Signals need context and participation.' },
		{ icon: ShieldCheck, title: 'Right of reply', body: 'Verified context, anti-retaliation rules and a real dispute process, designed with the community.' }
	];

	const postRole = `mailto:hello@specialtycoffeecommunity.com?subject=${encodeURIComponent('Posting a coffee job')}&body=${encodeURIComponent(
		'Business name:\nRole:\nCity and country:\nFull time / part time / contract:\nPay range:\n'
	)}`;
</script>

<svelte:head>
	<title>Coffee jobs — Specialty Coffee Community</title>
	<meta
		name="description"
		content="A coffee job board where applying is free. Make your Coffee CV now, get found by community-minded employers, and apply free when listings open."
	/>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main>
	<section class="border-b-2 border-espresso">
		<div class="mx-auto max-w-[1344px] px-6 pt-14 pb-16 md:px-8">
			<p class="eyebrow flex items-center gap-2">Jobs <span class="chip bg-base-100 text-[10px] text-crema">Listings opening soon</span></p>
			<h1 class="display mt-4 max-w-[16ch] text-[44px] leading-[1.05] font-semibold tracking-[-0.025em] md:text-[64px]">
				Coffee work, <span class="squiggle inline-block text-primary italic">in focus.</span>
			</h1>
			<p class="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-roast">
				A job board where coffee people already are. Your Coffee CV, being discovered and applying are free. Employers pay
				a small fee per vacancy, and that keeps it free for you.
			</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				{#if me}
					<a href="/welcome" class="btn h-14 btn-primary btn-zine px-7 text-base">Set yourself as open to work <ArrowRight class="size-4" /></a>
				{:else}
					<a href="/auth?mode=signup" class="btn h-14 btn-primary btn-zine px-7 text-base">Make my Coffee CV — free <ArrowUpRight class="size-4" /></a>
				{/if}
				<a href="#employers" class="btn h-14 btn-zine bg-base-100 px-7 text-base">I’m hiring <ArrowRight class="size-4" /></a>
			</div>
			<p class="mt-5 font-mono text-[11px] tracking-[0.1em] text-crema uppercase">Free to create · Free to be discovered · Free to apply</p>
		</div>
	</section>

	<!-- For professionals -->
	<section class="mx-auto max-w-[1100px] px-6 py-24">
		<p class="eyebrow">For coffee professionals</p>
		<h2 class="mt-4 max-w-[20ch] text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">
			Get ready now. Get found when it opens.
		</h2>
		<ol class="mt-12 grid gap-6 md:grid-cols-3">
			{#each steps as step, i (step.title)}
				<li class="card-zine p-7">
					<div class="flex items-center justify-between">
						<step.icon class="size-6 text-primary" strokeWidth={1.75} />
						<span class="font-mono text-xs text-crema">0{i + 1}</span>
					</div>
					<h3 class="mt-6 text-2xl font-medium">{step.title}</h3>
					<p class="mt-2 text-[15px] leading-relaxed text-roast">{step.body}</p>
				</li>
			{/each}
		</ol>
		<a href="/members/example" class="link-zine mt-8 inline-flex">See what employers will see: an example Coffee CV <ArrowRight class="size-4" /></a>
	</section>

	<!-- Example board -->
	<section class="border-y-2 border-espresso bg-base-300 py-24">
		<div class="mx-auto max-w-[1100px] px-6">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">A preview of the board</p>
					<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">What listings will look like.</h2>
				</div>
				<span class="chip bg-base-100">Examples only · not live vacancies</span>
			</div>
			<ul class="mt-10 card-zine divide-y-2 divide-line overflow-hidden">
				{#each examples as job (job.title)}
					<li class="flex flex-wrap items-center gap-x-6 gap-y-2 px-7 py-5">
						<Briefcase class="size-5 shrink-0 text-primary" />
						<div class="min-w-0 flex-1">
							<p class="text-[19px] font-semibold">{job.title}</p>
							<p class="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-roast">
								{job.employer}
								<span class="flex items-center gap-1 font-mono text-xs text-crema uppercase"><MapPin class="size-3.5" />{job.where}</span>
							</p>
						</div>
						<span class="chip bg-base-100">{job.type}</span>
						<span class="w-24 text-right font-mono text-sm font-semibold">{job.pay}</span>
					</li>
				{/each}
			</ul>
			<p class="mt-5 text-sm text-roast">Every listing will show pay. Applying will always be free.</p>
		</div>
	</section>

	<!-- Feedback loop -->
	<section class="mx-auto max-w-[1100px] px-6 py-24">
		<p class="eyebrow">Where it’s heading</p>
		<h2 class="mt-4 max-w-[22ch] text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">
			Find the right role. <span class="text-primary italic">Learn from what happens next.</span>
		</h2>
		<p class="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-roast">
			After a role ends, both sides could leave specific, two-way feedback: a next step for the professional, and an honest
			read on the workplace for the employer. This is a direction we’re designing with the community, not something that
			exists yet.
		</p>
		<div class="mt-10 grid gap-6 md:grid-cols-2">
			<div class="card-zine p-7">
				<p class="font-mono text-xs tracking-[0.12em] text-primary uppercase">Hirer → professional</p>
				<h3 class="mt-3 text-2xl font-medium">Feedback that gives someone a next step.</h3>
				<p class="mt-2 text-[15px] leading-relaxed text-roast">Demonstrated craft, working together, growth edges and a useful next move. Not a vague score.</p>
			</div>
			<div class="card-zine p-7">
				<p class="font-mono text-xs tracking-[0.12em] text-primary uppercase">Professional → employer</p>
				<h3 class="mt-3 text-2xl font-medium">Feedback that helps a workplace improve.</h3>
				<p class="mt-2 text-[15px] leading-relaxed text-roast">Expectations, support and working conditions, and whether the workplace lived up to what it promised.</p>
			</div>
		</div>
		<ul class="mt-10 grid gap-6 sm:grid-cols-2">
			{#each safeguards as item (item.title)}
				<li class="flex gap-3">
					<item.icon class="mt-0.5 size-5 shrink-0 text-primary" />
					<div>
						<p class="font-semibold">{item.title}</p>
						<p class="text-sm leading-relaxed text-roast">{item.body}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<!-- For employers -->
	<section id="employers" class="scroll-mt-24 bg-neutral text-neutral-content">
		<div class="mx-auto max-w-[1100px] px-6 py-24">
			<p class="eyebrow text-secondary">For employers</p>
			<h2 class="display mt-4 max-w-[18ch] text-[36px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[52px]">
				Hire where coffee people <span class="text-primary italic">already are.</span>
			</h2>
			<p class="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-neutral-content/80">
				Cafés, roasters, chains and importers pay a flat fee per vacancy, priced by country group. That fee keeps Coffee
				CVs, discovery and applications free for everyone else.
			</p>
			<div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
				{#each prices as p (p.group)}
					<div class="rounded-[14px] border-2 border-neutral-content/25 p-5 text-center">
						<p class="font-mono text-[11px] tracking-[0.12em] text-neutral-content/60 uppercase">{p.group}</p>
						<p class="mt-2 font-display text-4xl font-semibold">{p.price}</p>
						<p class="mt-1 font-mono text-[10px] tracking-[0.1em] text-neutral-content/60 uppercase">per vacancy</p>
					</div>
				{/each}
			</div>
			<p class="mt-4 text-sm text-neutral-content/60">Countries we haven’t grouped yet default to Group 3.</p>
			<div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
				<a href={postRole} class="btn h-14 btn-primary px-7 text-base"><Mail class="size-4" /> Tell us about your role</a>
				<p class="text-sm text-neutral-content/70">
					Online posting opens with the board. Email us now and we’ll list your role first.
				</p>
			</div>
		</div>
	</section>

	<section class="py-20 text-center">
		<div class="mx-auto max-w-[640px] px-6">
			<Users class="mx-auto size-8 text-primary" strokeWidth={1.75} />
			<h2 class="display mt-5 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[40px]">Be findable before the board opens.</h2>
			<p class="mt-4 text-roast">Employers will start with people who already have a Coffee CV.</p>
			<a href={me ? '/welcome' : '/auth?mode=signup'} class="btn mt-8 h-14 btn-primary btn-zine px-7 text-base">
				{me ? 'Update your Coffee CV' : 'Make my Coffee CV — free'} <ArrowRight class="size-4" />
			</a>
		</div>
	</section>
</main>

<SiteFooter />
