<script lang="ts">
	import { avatarColors, resolveAvatar } from './icons.js';

	let {
		userId,
		icon,
		hue,
		size = 48,
		class: className = ''
	}: {
		/** Seeds the default avatar until the member picks one. */
		userId: string;
		icon?: string | null;
		hue?: number | null;
		size?: number;
		class?: string;
	} = $props();

	const avatar = $derived(resolveAvatar(userId, icon, hue));
	const colors = $derived(avatarColors(avatar.hue));
</script>

<span
	role="img"
	aria-label="{avatar.icon.label} avatar"
	class="inline-grid shrink-0 place-items-center rounded-full {className}"
	style:width="{size}px"
	style:height="{size}px"
	style:background={colors.background}
	style:color={colors.ink}
>
	<svg
		viewBox="0 0 48 48"
		width="66%"
		height="66%"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{@html avatar.icon.body}
	</svg>
</span>
