<script lang="ts">
	import SiteHeader from '#lib/components/SiteHeader.svelte';
</script>

<svelte:head>
	<title>Link expired — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main class="mx-auto flex min-h-[calc(100svh-108px)] max-w-md flex-col justify-center px-6 py-16 text-center">
	<div class="card-zine p-8 shadow-zine-lg">
		<p class="eyebrow">Hmm.</p>
		<h1 class="display mt-3 text-3xl font-semibold">That link didn't work</h1>
		<p class="mt-3 text-[15px] text-roast">
			It may have expired or already been used. Email links work once and last an hour.
		</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<a href="/auth" class="btn btn-primary btn-zine">Sign in</a>
			<a href="/auth?mode=forgot" class="btn btn-zine bg-base-100">Send a new reset link</a>
		</div>
	</div>
</main>
