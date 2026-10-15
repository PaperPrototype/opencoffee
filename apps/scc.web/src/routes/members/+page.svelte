<script lang="ts">
	import { Lock, Search, Users, X } from '@lucide/svelte';
	import { Avatar } from 'avatars';
	import { page } from '$app/state';
	import { formatMemberNumber } from '#lib/badges.js';
	import MemberBadge from '#lib/components/MemberBadge.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const joined = (iso: string | null) =>
		iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

	function withParam(key: string, value: string) {
		const params = new URLSearchParams(page.url.searchParams.toString());
		params.delete('page');
		if (!value || params.get(key) === value) params.delete(key);
		else params.set(key, value);
		const qs = params.toString();
		return qs ? `/members?${qs}` : '/members';
	}
	function pageLink(n: number) {
		const params = new URLSearchParams(page.url.searchParams.toString());
		if (n === 1) params.delete('page');
		else params.set('page', String(n));
		const qs = params.toString();
		return qs ? `/members?${qs}` : '/members';
	}
	const chip = 'chip px-3.5 py-1.5 transition-colors hover:bg-espresso hover:text-paper';
</script>

<svelte:head>
	<title>Members — Specialty Coffee Community</title>
	<meta name="description" content="Baristas, roasters, producers and home brewers — the members of Specialty Coffee Community." />
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main>
	<section class="border-b-2 border-espresso">
		<div class="mx-auto max-w-[1344px] px-6 pt-14 pb-12 md:px-8">
			<p class="eyebrow">Members</p>
			<h1 class="display mt-4 max-w-[18ch] text-[44px] leading-[1.08] font-semibold tracking-[-0.025em] md:text-[64px]">
				The people behind <span class="squiggle inline-block text-primary italic">the cups.</span>
			</h1>
			<p class="mt-5 flex items-center gap-2 font-mono text-[13px] text-crema uppercase">
				<Users class="size-4 text-primary" />
				{data.total.toLocaleString('en-US')}
				{data.total === 1 ? 'member' : 'members'} and counting
			</p>

			<!-- Early-member badge runs -->
			<div class="mt-10 grid gap-5 md:grid-cols-3">
				{#each data.runs as run (run.id)}
					<div class="flex items-center gap-5 card-zine p-5">
						<MemberBadge badge={run.id} size="medal" label={false} class="w-20 shrink-0" />
						<div class="min-w-0 flex-1">
							<p class="font-semibold">{run.label}</p>
							<p class="font-mono text-xs text-crema">Members {formatMemberNumber(run.from)}–{formatMemberNumber(run.limit)}</p>
							<div class="mt-3 h-2 overflow-hidden rounded-full border-[1.5px] border-espresso bg-base-200" aria-hidden="true">
								<div class="h-full {run.tone.split(' ')[0]}" style:width="{(run.claimed / run.size) * 100}%"></div>
							</div>
							<p class="mt-1.5 font-mono text-[11px] tracking-[0.08em] uppercase {run.left ? 'text-primary' : 'text-crema'}">
								{run.left === 0 ? 'All claimed' : `${run.left.toLocaleString('en-US')} ${run.left === 1 ? 'spot' : 'spots'} left`}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	{#if !data.members}
		<!-- Signed out: the directory is members-only. -->
		<section class="bg-base-300 py-20">
			<div class="mx-auto max-w-2xl px-6 text-center">
				<span class="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-espresso bg-base-100 shadow-zine-sm"><Lock class="size-6" /></span>
				<h2 class="display mt-6 text-[34px] leading-tight font-semibold tracking-[-0.02em]">The directory is for members.</h2>
				<p class="mt-3 text-roast">
					Join free to find mentors, peers and people near you.
					{#if data.next.badge}
						Join now and you'll be member {formatMemberNumber(data.next.number)} — with the
						<strong class="text-espresso">{data.next.badge}</strong> badge.
					{/if}
				</p>
				<div class="mt-8 flex flex-wrap justify-center gap-3">
					<a href="/auth?mode=signup&next=/members" class="btn btn-primary btn-zine">Join free</a>
					<a href="/auth?next=/members" class="btn btn-zine bg-base-100">Sign in</a>
				</div>
			</div>
		</section>
	{:else}
		<section class="bg-base-300 py-12">
			<div class="mx-auto max-w-[1344px] px-6 md:px-8">
				<div class="flex flex-wrap items-center gap-3">
					<form method="GET" class="flex min-w-[260px] flex-1 items-center card-zine shadow-zine-sm sm:max-w-md">
						{#if data.filters?.badge}<input type="hidden" name="badge" value={data.filters.badge} />{/if}
						{#if data.filters?.sort === 'newest'}<input type="hidden" name="sort" value="newest" />{/if}
						<Search class="ml-4 size-4 shrink-0 text-crema" />
						<label class="sr-only" for="q">Search members</label>
						<input id="q" name="q" type="search" defaultValue={data.filters?.q ?? ''} placeholder="Search by name" class="input h-11 w-full border-0 bg-transparent px-3 focus:outline-none" />
					</form>
					<div class="flex flex-wrap gap-2">
						<a href={withParam('badge', '')} class="{chip} {!data.filters?.badge ? 'bg-espresso text-paper' : 'bg-base-100'}">All</a>
						{#each data.runs as run (run.id)}
							<a href={withParam('badge', run.id)} class="{chip} {data.filters?.badge === run.id ? 'bg-espresso text-paper' : 'bg-base-100'}">{run.label}</a>
						{/each}
						<span class="mx-1 h-5 w-0.5 self-center bg-line" aria-hidden="true"></span>
						<a href={withParam('sort', 'newest')} class="{chip} {data.filters?.sort === 'newest' ? 'bg-espresso text-paper' : 'bg-base-100'}">Newest first</a>
					</div>
					{#if data.filters?.q || data.filters?.badge || data.filters?.sort === 'newest'}
						<a href="/members" class="link-zine text-sm"><X class="size-4" /> Clear</a>
					{/if}
				</div>

				{#if data.members.length}
					<ul class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each data.members as m (m.id)}
							<li>
								<a href="/members/{m.member_number}" class="group flex h-full flex-col card-zine card-zine-hover p-5">
									<div class="flex items-start gap-4">
										<Avatar userId={m.user_id!} icon={m.avatar_icon} hue={m.avatar_hue} size={56} class="border-2 border-espresso" />
										<div class="min-w-0">
											<p class="truncate text-lg font-semibold group-hover:text-primary">
												{m.display_name || `Member ${formatMemberNumber(m.member_number!)}`}
												{#if m.user_id === data.me}<span class="ml-1 font-mono text-[11px] font-normal text-crema uppercase">· you</span>{/if}
											</p>
											<p class="font-mono text-xs text-crema">{formatMemberNumber(m.member_number!)} · joined {joined(m.created_at)}</p>
										</div>
									</div>
									{#if m.bio}<p class="mt-3 line-clamp-2 text-sm text-roast">{m.bio}</p>{/if}
									{#if m.badge}<div class="mt-auto pt-4"><MemberBadge badge={m.badge} /></div>{/if}
								</a>
							</li>
						{/each}
					</ul>

					{#if data.pages > 1}
						<nav class="mt-10 flex items-center justify-center gap-2" aria-label="Pages">
							{#if data.page > 1}<a href={pageLink(data.page - 1)} class="btn btn-zine btn-sm bg-base-100">← Previous</a>{/if}
							<span class="px-3 font-mono text-sm">Page {data.page} of {data.pages}</span>
							{#if data.page < data.pages}<a href={pageLink(data.page + 1)} class="btn btn-zine btn-sm bg-base-100">Next →</a>{/if}
						</nav>
					{/if}
				{:else}
					<div class="mt-8 card-zine p-10 text-center">
						<p class="text-lg font-medium">No members match that.</p>
						<a href="/members" class="link-zine mt-3">See everyone</a>
					</div>
				{/if}
			</div>
		</section>
	{/if}
</main>

<SiteFooter />
