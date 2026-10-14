<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A one-button POST form for actions that redirect off-site (Stripe onboarding, dashboard).
	 * The round trip to Stripe takes a few seconds, so the button shows a spinner as soon as it's
	 * clicked and can't be clicked twice.
	 */
	let {
		action,
		class: className = '',
		pendingLabel = 'Opening Stripe…',
		children
	}: { action: string; class?: string; pendingLabel?: string; children: Snippet } = $props();

	let pending = $state(false);
</script>

<!-- Coming back with the browser's Back button restores this page from cache: re-enable the button. -->
<svelte:window onpageshow={(e) => e.persisted && (pending = false)} />

<form
	method="POST"
	{action}
	onsubmit={(e) => {
		// Already on its way to Stripe: ignore further clicks / Enter presses.
		if (pending) e.preventDefault();
		pending = true;
	}}
>
	<!-- Not `disabled`/aria-disabled: daisyUI greys those out, which reads as broken rather than busy. -->
	<button class="{className} {pending ? 'pointer-events-none cursor-wait' : ''}" aria-busy={pending}>
		{#if pending}
			<span class="loading loading-sm loading-spinner"></span>
			{pendingLabel}
		{:else}
			{@render children()}
		{/if}
	</button>
</form>
