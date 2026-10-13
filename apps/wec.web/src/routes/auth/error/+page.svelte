<script lang="ts">
	import { CircleAlert } from '@lucide/svelte';
	import SiteNav from '#lib/components/SiteNav.svelte';
</script>

<svelte:head>
	<title>Link expired | World Espresso Championship</title>
</svelte:head>

<SiteNav />

<main class="mx-auto flex min-h-[calc(100svh-7.5rem)] max-w-md flex-col justify-center px-4 py-16">
	<div class="card-board p-8 text-center">
		<CircleAlert class="mx-auto size-10 text-cinnamon-light" />
		<h1 class="mt-4 text-3xl font-extrabold tracking-tight">That link didn't work</h1>
		<p class="mt-3 text-[15px] text-sand/70">It may have expired or already been used. Email links work once and last an hour.</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<a href="/auth" class="btn rounded-lg btn-secondary">Sign in</a>
			<a href="/auth?mode=forgot" class="btn rounded-lg border-sand/20 bg-transparent text-sand btn-outline hover:bg-sand/10">Send a new reset link</a>
		</div>
	</div>
</main>
