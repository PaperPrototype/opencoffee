<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import favicon from '#lib/assets/favicon.svg';
	import Celebration from '#lib/components/Celebration.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		// Re-run the layout load whenever the session changes (sign in/out, token refresh, other tabs).
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== data.session?.expires_at) invalidate('supabase:auth');
		});
		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<!-- First visit after signing up as one of the first 10 / 100 / 1,000 members: confetti, once. -->
{#if data.celebration}
	<Celebration {...data.celebration} />
{/if}
