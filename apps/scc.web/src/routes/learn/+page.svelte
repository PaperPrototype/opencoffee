<script lang="ts">
	import { ArrowRight, BadgeCheck, Camera, Check, Eye, Send, X } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	const me = $derived(page.data.me);
	let sending = $state(false);

	const layers = [
		{
			n: '01',
			status: 'Free · on the way',
			title: 'Master of Actual Coffee',
			body: 'The free fundamentals course: a map of coffee, not a dogma. A playful title, never a claim of mastery. There are no levels, and no one masters coffee.'
		},
		{
			n: '02',
			status: 'In development',
			title: 'Skills assessments',
			body: 'Short, observable pass/fail demonstrations of real skill, verified live by an SCC assessor. Pass, and a skills badge lands on your Coffee CV.'
		},
		{
			n: '03',
			status: 'The plan',
			title: 'Community short courses',
			body: 'Specific topics taught by member trainers and creators, in their own style, at their own price. Some free, some paid. Creators keep 80%.'
		}
	];

	const assessmentSteps = [
		{ title: 'Book', body: 'Book an assessment with an SCC assessor.' },
		{ title: 'We come to you', body: 'Assessed where you actually work, on the machine and grinder you actually use.' },
		{ title: 'Demonstrate', body: 'You perform the skill while the assessor observes against a written protocol.' },
		{ title: 'Verified', body: 'Pass, and the badge is on your profile the same day.' }
	];

	const never = [
		'A single judge’s taste or “quality” verdict of any kind.',
		'Taste conformity. No assessment rewards making coffee “the one correct way”.',
		'Written memory exams as a condition of a skills badge.',
		'Anything the customer in front of you doesn’t actually care about.'
	];
</script>

<svelte:head>
	<title>Learn — Specialty Coffee Community</title>
	<meta
		name="description"
		content="Free coffee fundamentals, objective skills assessments that put verifiable badges on your Coffee CV, and community-taught courses."
	/>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main>
	<section class="border-b-2 border-espresso">
		<div class="mx-auto max-w-[1344px] px-6 pt-14 pb-16 md:px-8">
			<p class="eyebrow flex items-center gap-2">Learn <span class="chip bg-base-100 text-[10px] text-crema">Opening in stages</span></p>
			<h1 class="display mt-4 max-w-[16ch] text-[44px] leading-[1.05] font-semibold tracking-[-0.025em] md:text-[64px]">
				Proof, <span class="squiggle inline-block text-primary italic">not attendance.</span>
			</h1>
			<p class="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-roast">
				A free shared map of coffee, objective proof of real skill, and community-taught depth in every direction. Marked
				honestly, layer by layer, so you always know what’s live and what’s coming.
			</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<a href="#updates" class="btn h-14 btn-primary btn-zine px-7 text-base">Email me when it opens <ArrowRight class="size-4" /></a>
				<a href="#layers" class="btn h-14 btn-zine bg-base-100 px-7 text-base">See the three layers</a>
			</div>
		</div>
	</section>

	<section id="layers" class="mx-auto max-w-[1100px] scroll-mt-24 px-6 py-24">
		<p class="eyebrow">The education model</p>
		<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">One honest system.</h2>
		<div class="mt-12 grid gap-6 md:grid-cols-3">
			{#each layers as layer (layer.n)}
				<article class="flex flex-col card-zine p-7">
					<div class="flex items-center justify-between">
						<span class="font-mono text-xs text-crema">Layer {layer.n}</span>
						<span class="chip bg-base-200 text-[10px]">{layer.status}</span>
					</div>
					<h3 class="mt-6 text-2xl font-medium">{layer.title}</h3>
					<p class="mt-2 text-[15px] leading-relaxed text-roast">{layer.body}</p>
				</article>
			{/each}
		</div>
		<p class="mt-6 text-sm text-roast">
			The free layer is funded by employer job ads, paid ticketing, and a small commission on paid assessments and courses.
		</p>
	</section>

	<section class="border-y-2 border-espresso bg-base-300 py-24">
		<div class="mx-auto grid max-w-[1100px] gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
			<div>
				<p class="eyebrow">Skills assessments</p>
				<h2 class="mt-4 text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">Proof, not paperwork.</h2>
				<p class="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-roast">
					Objective pass/fail criteria a camera could verify: observable, repeatable, short, done on your own equipment,
					and designed with the community. No taste judgments. No opinions.
				</p>
				<blockquote class="mt-8 border-l-4 border-primary pl-5 font-display text-xl leading-snug italic">
					“We assess what a camera could verify. Taste is assessed by your customers, every cup, for free.”
				</blockquote>
				<ol class="mt-10 grid gap-4 sm:grid-cols-2">
					{#each assessmentSteps as step, i (step.title)}
						<li class="card-zine p-5">
							<p class="font-mono text-xs text-primary">0{i + 1}</p>
							<p class="mt-2 font-semibold">{step.title}</p>
							<p class="mt-1 text-sm leading-relaxed text-roast">{step.body}</p>
						</li>
					{/each}
				</ol>
			</div>
			<div class="grid content-start gap-6">
				<div class="card-zine p-7">
					<p class="flex items-center gap-2 font-semibold"><BadgeCheck class="size-5 text-primary" /> On your Coffee CV</p>
					<p class="mt-2 text-sm leading-relaxed text-roast">
						Skills badges show on your Coffee CV, where employers already look. Each one says exactly what was
						demonstrated (the skill, the tolerance, the repetitions) and nothing more.
					</p>
					<a href="/members/example" class="link-zine mt-4 text-sm">See an example Coffee CV <ArrowRight class="size-4" /></a>
				</div>
				<div class="card-zine p-7">
					<p class="flex items-center gap-2 font-semibold"><Camera class="size-5 text-primary" /> What we will never assess</p>
					<ul class="mt-4 grid gap-3">
						{#each never as item (item)}
							<li class="flex gap-2 text-sm leading-relaxed text-roast"><X class="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</section>

	<section id="updates" class="scroll-mt-24 py-24">
		<div class="mx-auto max-w-[640px] px-6 text-center">
			<p class="eyebrow">Education updates</p>
			<h2 class="display mt-4 text-[34px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[44px]">We’ll tell you when.</h2>
			<p class="mt-4 text-roast">
				One email when Master of Actual Coffee, skills assessments or creator courses open. Nothing else.
			</p>
			{#if form && 'subscribed' in form}
				<p role="status" class="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-[10px] border-2 border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
					<Check class="size-4" /> You’re on the list. We’ll email you when it opens.
				</p>
			{:else}
				<form
					method="POST"
					action="?/updates"
					class="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
					use:enhance={() => {
						sending = true;
						return async ({ update }) => {
							await update({ reset: false, invalidateAll: false });
							sending = false;
						};
					}}
				>
					<label class="sr-only" for="updates-email">Email</label>
					<input
						id="updates-email"
						name="email"
						type="email"
						required
						autocomplete="email"
						placeholder="you@coffeeplace.com"
						value={form?.email ?? ''}
						class="input h-14 flex-1 field-zine"
					/>
					<input type="text" name="company" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
					<button type="submit" disabled={sending} class="btn h-14 btn-primary btn-zine px-6 text-base">
						{sending ? 'Adding…' : 'Email me'} <Send class="size-4" />
					</button>
				</form>
				{#if form?.updatesError}<p role="alert" class="mt-3 text-sm text-error">{form.updatesError}</p>{/if}
			{/if}
			{#if !me}
				<p class="mt-8 flex items-center justify-center gap-2 text-sm text-roast">
					<Eye class="size-4 text-primary" /> Badges will need a Coffee CV to show on.
					<a href="/auth?mode=signup" class="link-zine">Make yours free</a>
				</p>
			{/if}
		</div>
	</section>
</main>

<SiteFooter />
