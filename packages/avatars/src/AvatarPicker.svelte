<script lang="ts">
	import { untrack } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { avatarColors, avatarIcons, resolveAvatar } from './icons.js';

	/**
	 * Icon grid + hue slider. Renders `avatar_icon` and `avatar_hue` form fields, so drop it inside
	 * a <form> and read them in the action. Unstyled beyond layout: each site's theme styles it via
	 * `class` hooks and daisyUI's `range`.
	 */
	let { userId, icon, hue }: { userId: string; icon?: string | null; hue?: number | null } = $props();

	// The saved avatar (or their default) is only the starting point; after that the controls own it.
	const start = untrack(() => resolveAvatar(userId, icon, hue));
	let selected = $state(start.icon.id);
	let selectedHue = $state(start.hue);

	// Rainbow track at the avatar's lightness, so the slider previews exactly what you'll get.
	const track = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => avatarColors(i * 30).background).join(', ')})`;
</script>

<div class="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
	<Avatar {userId} icon={selected} hue={selectedHue} size={112} class="mx-auto sm:mx-0" />

	<div class="min-w-0">
		<fieldset>
			<legend class="avatar-picker-label">Picture</legend>
			<div class="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
				{#each avatarIcons as option (option.id)}
					<label
						class="avatar-picker-option grid cursor-pointer place-items-center rounded-full p-0.5 ring-offset-2 has-checked:ring-2 has-focus-visible:ring-2"
						title={option.label}
					>
						<input type="radio" name="avatar_icon" value={option.id} bind:group={selected} class="sr-only" />
						<Avatar {userId} icon={option.id} hue={selectedHue} size={40} />
						<span class="sr-only">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<label class="mt-5 block">
			<span class="avatar-picker-label">Color</span>
			<input
				type="range"
				name="avatar_hue"
				min="0"
				max="359"
				step="1"
				bind:value={selectedHue}
				class="range mt-3 w-full [--range-bg:transparent] [--range-fill:0]"
				style:background={track}
				style:color={avatarColors(selectedHue).ink}
				aria-valuetext="Hue {selectedHue}"
			/>
		</label>
	</div>
</div>
