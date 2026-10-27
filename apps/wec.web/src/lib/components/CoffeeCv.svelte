<script lang="ts">
	import { AtSign, BadgeCheck, Globe, MapPin } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { availabilityLabel, roleLabel, type ExperienceEntry } from 'profile';

	/**
	 * A member's SCC Coffee CV on the scoreboard: who they are, what they do, where they've worked.
	 * Used on the account page and as the live preview while onboarding.
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
		/** Top row, right: "Draft", "Member since 2026"… */
		note = ''
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
		note?: string;
	} = $props();

	const status = $derived(availabilityLabel(availability));
	const host = $derived.by(() => {
		try {
			return website ? new URL(website).hostname.replace(/^www\./, '') : null;
		} catch {
			return null;
		}
	});
</script>

<article class="card-board p-6 sm:p-7" aria-label="Coffee CV for {name || 'this member'}">
	<div class="flex items-center justify-between gap-4 border-b border-sand/10 pb-3">
		<span class="label-muted">SCC Coffee CV · Nº {memberNumber.toLocaleString('en-US')}</span>
		<span class="label-muted">{note}</span>
	</div>

	<div class="mt-6 flex items-center gap-4">
		<Avatar {userId} icon={avatarIcon} hue={avatarHue} size={64} class="ring-2 ring-sand/20" />
		<div class="min-w-0">
			<h2 class="text-2xl font-extrabold tracking-tight break-words sm:text-3xl">{name || 'Your name'}</h2>
			{#if headline}<p class="mt-1 text-sand/75">{headline}</p>{/if}
			{#if location}<p class="label-muted mt-2 flex items-center gap-1.5"><MapPin class="size-3.5" />{location}</p>{/if}
		</div>
	</div>

	{#if status || yearsInCoffee !== null}
		<div class="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
			{#if status}<span class="badge badge-soft badge-success"><BadgeCheck class="size-3.5" />{status}</span>{/if}
			{#if yearsInCoffee !== null}
				<span class="badge badge-soft">{yearsInCoffee === 0 ? 'New to coffee' : `${yearsInCoffee} ${yearsInCoffee === 1 ? 'year' : 'years'} in coffee`}</span>
			{/if}
		</div>
	{/if}

	{#if bio}<p class="mt-5 leading-relaxed whitespace-pre-line text-sand/80">{bio}</p>{/if}

	{#if roles.length}
		<h3 class="label-muted mt-6">Roles</h3>
		<div class="mt-2 flex flex-wrap gap-2">
			{#each roles as role (role)}<span class="badge border-0 bg-copper font-semibold text-espresso">{roleLabel(role)}</span>{/each}
		</div>
	{/if}

	{#if skills.length}
		<h3 class="label-muted mt-6">Skills</h3>
		<div class="mt-2 flex flex-wrap gap-2">
			{#each skills as skill (skill)}<span class="badge badge-outline border-sand/25 text-sand/80">{skill}</span>{/each}
		</div>
	{/if}

	{#if experience.length}
		<h3 class="label-muted mt-6">Experience</h3>
		<ul class="mt-1 divide-y divide-sand/10">
			{#each experience as job, i (i)}
				<li class="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-4">
					<div>
						<p class="font-semibold">{job.role}</p>
						{#if job.detail}<p class="mt-0.5 text-sm text-sand/60">{job.detail}</p>{/if}
					</div>
					<p class="text-sm text-amber sm:max-w-[180px] sm:text-right">{job.place}</p>
				</li>
			{/each}
		</ul>
	{/if}

	{#if host || instagram}
		<div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-sand/10 pt-4 text-sm">
			{#if host}
				<a href={website} rel="noopener nofollow ugc" target="_blank" class="flex items-center gap-1.5 text-cinnamon-light hover:text-sand"><Globe class="size-4" />{host}</a>
			{/if}
			{#if instagram}
				<a href="https://instagram.com/{instagram}" rel="noopener nofollow ugc" target="_blank" class="flex items-center gap-1.5 text-cinnamon-light hover:text-sand"><AtSign class="size-4" />{instagram}</a>
			{/if}
		</div>
	{/if}
</article>
