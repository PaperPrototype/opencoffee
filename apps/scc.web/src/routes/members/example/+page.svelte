<script lang="ts">
	import { ArrowRight, ArrowUpRight, BadgeCheck, Eye, Hash } from '@lucide/svelte';
	import { page } from '$app/state';
	import { badgeById, formatMemberNumber } from '#lib/badges.js';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import MemberBadge from '#lib/components/MemberBadge.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { exampleCv } from '#lib/landing.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const me = $derived(page.data.me);
	const nextBadge = $derived(badgeById(data.next.badge));

	// What each part of the CV does for its owner, pinned beside the example.
	const notes = [
		{ icon: Hash, title: 'Your founding number', body: 'Assigned in signup order and never reissued. The first 100, 1,000 and 10,000 members get a permanent badge.' },
		{ icon: BadgeCheck, title: '“Open to the right role”', body: 'Employers browsing the directory see who is open to work. Switch it off any time.' },
		{ icon: Eye, title: 'Visible to the community', body: 'Members find you by name, role and skills: mentors, peers and people hiring near you.' }
	];
</script>

<svelte:head>
	<title>Example Coffee CV — Specialty Coffee Community</title>
	<meta name="description" content="See what a finished Coffee CV looks like: roles, skills, experience and a permanent founding member badge." />
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto max-w-[1100px] px-6 py-14 {me ? '' : 'max-lg:pb-32'}">
	<p class="eyebrow">Example Coffee CV</p>
	<h1 class="display mt-3 max-w-[22ch] text-[36px] leading-[1.08] font-semibold tracking-[-0.025em] md:text-[48px]">
		This is what yours could look like.
	</h1>
	<p class="mt-4 max-w-[60ch] text-roast">
		Daniel is an illustrative member, not a real profile. Everything you see here is a field you fill in during signup, in about four minutes.
	</p>

	<section class="mt-10 grid items-start gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
		<CoffeeCv {...exampleCv} strip={['Public Coffee CV', 'Example profile']} />

		<aside class="grid gap-5 lg:sticky lg:top-28">
			<div class="grid justify-items-center gap-3 card-zine p-5 text-center">
				<MemberBadge badge="first_100" size="medal" number={exampleCv.memberNumber} class="w-full max-w-64" />
				<p class="text-sm text-roast">Daniel's badge. It sits on his profile for good.</p>
			</div>

			<ul class="grid gap-4">
				{#each notes as note (note.title)}
					<li class="flex gap-3">
						<note.icon class="mt-0.5 size-5 shrink-0 text-primary" />
						<div>
							<p class="font-semibold">{note.title}</p>
							<p class="text-sm leading-relaxed text-roast">{note.body}</p>
						</div>
					</li>
				{/each}
			</ul>

			<div class="card-zine bg-secondary p-5">
				{#if me}
					<p class="font-semibold">Yours is live.</p>
					<p class="mt-1 text-sm text-roast">Fill in the parts you haven't yet. Complete CVs get found first.</p>
					<div class="mt-4 grid gap-2">
						<a href="/welcome" class="btn btn-primary btn-zine">Edit your Coffee CV <ArrowRight class="size-4" /></a>
						<a href="/members/{me.memberNumber}" class="btn btn-zine bg-base-100">See your profile</a>
					</div>
				{:else}
					<p class="font-semibold">
						{#if nextBadge}
							The next member is {formatMemberNumber(data.next.number)}: {nextBadge.title}.
						{:else}
							Make yours. It's free.
						{/if}
					</p>
					<p class="mt-1 text-sm text-roast">No card, no trial, no premium tier. About four minutes.</p>
					<a href="/auth?mode=signup" class="btn mt-4 w-full btn-primary btn-zine">
						Create my Coffee CV — free <ArrowUpRight class="size-4" />
					</a>
				{/if}
			</div>
		</aside>
	</section>
</main>

{#if !me}
	<!-- Phones: the CV is long, so the next step stays in reach instead of waiting at the bottom. -->
	<div class="fixed inset-x-0 bottom-0 z-40 border-t-2 border-espresso bg-base-200/95 px-4 py-3 backdrop-blur-sm lg:hidden">
		<a href="/auth?mode=signup" class="btn h-12 w-full btn-primary btn-zine text-base">
			{nextBadge ? `Claim ${formatMemberNumber(data.next.number)} — create my CV` : 'Create my Coffee CV — free'}
			<ArrowUpRight class="size-4" />
		</a>
	</div>
{/if}

<SiteFooter />
