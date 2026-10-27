<script lang="ts">
	import { AtSign, BadgeCheck, Globe, MapPin } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { availabilityLabel, roleLabel, type ExperienceEntry } from 'profile';
	import { badgeFor, formatMemberNumber } from '#lib/badges.js';
	import MemberBadge from '#lib/components/MemberBadge.svelte';

	/**
	 * A member's Coffee CV as a printed sheet: who they are, what they do, where they've worked.
	 * Used on member pages and as the live preview while onboarding.
	 */
	let {
		userId,
		memberNumber,
		name,
		headline = null,
		location = null,
		avatarIcon = null,
		avatarHue = null,
		bio = null,
		roles = [],
		yearsInCoffee = null,
		skills = [],
		experience = [],
		availability = null,
		website = null,
		instagram = null,
		/** Top strip, left and right: "Public Coffee CV" · "Member since 2026". */
		strip = ['Public Coffee CV', ''],
		class: className = ''
	}: {
		userId: string;
		memberNumber: number;
		name: string | null;
		headline?: string | null;
		location?: string | null;
		avatarIcon?: string | null;
		avatarHue?: number | null;
		bio?: string | null;
		roles?: readonly string[];
		yearsInCoffee?: number | null;
		skills?: readonly string[];
		experience?: readonly ExperienceEntry[];
		availability?: string | null;
		website?: string | null;
		instagram?: string | null;
		strip?: [string, string];
		class?: string;
	} = $props();

	const badge = $derived(badgeFor(memberNumber));
	const status = $derived(availabilityLabel(availability));
	const host = $derived.by(() => {
		try {
			return website ? new URL(website).hostname.replace(/^www\./, '') : null;
		} catch {
			return null;
		}
	});
</script>

<article class="card-zine p-6 shadow-zine-lg sm:p-7 {className}" aria-label="Coffee CV for {name || 'this member'}">
	<div class="flex items-center justify-between gap-4 border-b-2 border-line pb-3 font-mono text-[10px] tracking-[0.15em] text-crema uppercase">
		<span>{strip[0]}</span>
		<span>{strip[1]}</span>
	</div>

	<div class="mt-6 flex items-start gap-4">
		<Avatar {userId} icon={avatarIcon} hue={avatarHue} size={68} class="border-2 border-espresso" />
		<div class="min-w-0 flex-1">
			<h2 class="display text-[30px] leading-none font-semibold tracking-[-0.035em] break-words sm:text-[36px]">
				{name || `Member ${formatMemberNumber(memberNumber)}`}
			</h2>
			{#if headline}<p class="mt-2 font-medium text-roast">{headline}</p>{/if}
			{#if location}
				<p class="mt-2 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] text-crema uppercase">
					<MapPin class="size-3.5" />{location}
				</p>
			{/if}
		</div>
		{#if badge}<MemberBadge badge={badge.id} size="medal" label={false} number={memberNumber} class="-mt-1 w-14 shrink-0 sm:w-16" />{/if}
	</div>

	<div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y-2 border-line py-3 font-mono text-[11px] tracking-[0.08em] uppercase">
		{#if badge}<span class="text-crema">{badge.label}</span>{/if}
		<span class="font-semibold">Nº {memberNumber.toLocaleString('en-US')}</span>
		{#if yearsInCoffee !== null}
			<span class="text-crema">{yearsInCoffee === 0 ? 'New to coffee' : `${yearsInCoffee} ${yearsInCoffee === 1 ? 'yr' : 'yrs'} in coffee`}</span>
		{/if}
		{#if status}
			<span class="ml-auto flex items-center gap-1.5 text-accent"><BadgeCheck class="size-3.5" />{status}</span>
		{/if}
	</div>

	{#if bio}
		<p class="display mt-6 text-[21px] leading-[1.35] tracking-[-0.015em] whitespace-pre-line text-roast">“{bio}”</p>
	{/if}

	{#if roles.length}
		<h3 class="mt-6 font-mono text-[10px] font-medium tracking-[0.14em] text-crema uppercase">Roles</h3>
		<div class="mt-2.5 flex flex-wrap gap-2">
			{#each roles as role (role)}<span class="chip bg-espresso text-paper">{roleLabel(role)}</span>{/each}
		</div>
	{/if}

	{#if skills.length}
		<h3 class="mt-6 font-mono text-[10px] font-medium tracking-[0.14em] text-crema uppercase">Skills + working style</h3>
		<div class="mt-2.5 flex flex-wrap gap-2">
			{#each skills as skill (skill)}<span class="chip">{skill}</span>{/each}
		</div>
	{/if}

	{#if experience.length}
		<h3 class="mt-6 font-mono text-[10px] font-medium tracking-[0.14em] text-crema uppercase">Experience</h3>
		<ul class="mt-1 divide-y-2 divide-line">
			{#each experience as job, i (i)}
				<li class="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-4">
					<div>
						<p class="text-[15px] font-semibold">{job.role}</p>
						{#if job.detail}<p class="mt-0.5 text-sm leading-relaxed text-roast">{job.detail}</p>{/if}
					</div>
					<p class="font-mono text-[11px] tracking-[0.05em] text-crema uppercase sm:max-w-[180px] sm:text-right">{job.place}</p>
				</li>
			{/each}
		</ul>
	{/if}

	{#if host || instagram}
		<div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-espresso pt-4 text-sm">
			{#if host}
				<a href={website} rel="noopener nofollow ugc" target="_blank" class="link-zine"><Globe class="size-4" />{host}</a>
			{/if}
			{#if instagram}
				<a href="https://instagram.com/{instagram}" rel="noopener nofollow ugc" target="_blank" class="link-zine"><AtSign class="size-4" />{instagram}</a>
			{/if}
		</div>
	{/if}
</article>
