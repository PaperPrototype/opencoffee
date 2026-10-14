<script lang="ts">
	import { onMount } from 'svelte';
	import { categories, categoryIds, coverImage, timeZones, utcToZonedInput, type EventRow } from '#lib/events.js';
	import { currencies } from '#lib/money.js';

	let {
		event = null,
		secret = null,
		currencyLocked = false
	}: {
		/** Existing event when editing; null when creating. */
		event?: EventRow | null;
		/** Details only ticket holders see (event_private). */
		secret?: { online_url: string | null; attendee_info: string | null } | null;
		/** Currency can't change while paid tickets exist (prices would be reinterpreted). */
		currencyLocked?: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally -- initial values for an uncontrolled form
	let timezone = $state(event?.timezone ?? 'UTC');
	// svelte-ignore state_referenced_locally
	let isOnline = $state(event?.is_online ?? false);
	let preview = $state<string | null>(null);

	onMount(() => {
		if (!event) timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	});

	const local = (iso: string | undefined) => (iso && event ? utcToZonedInput(iso, event.timezone) : '');
	const label = 'font-mono text-[11px] tracking-[0.14em] text-crema uppercase';
	const optional = '<span class="normal-case tracking-normal">(optional)</span>';
</script>

<div class="grid gap-8">
	<fieldset class="fieldset gap-1">
		<legend class="mb-2 text-lg font-medium">Basics</legend>
		<label class={label} for="title">Title</label>
		<input id="title" name="title" required minlength="3" maxlength="140" class="input h-12 w-full field-zine" defaultValue={event?.title ?? ''} placeholder="Friday public cupping" />

		<label class="{label} mt-3" for="summary">One-line summary {@html optional}</label>
		<input id="summary" name="summary" maxlength="280" class="input h-12 w-full field-zine" defaultValue={event?.summary ?? ''} placeholder="Shown on cards and link previews" />

		<div class="mt-3 grid gap-4 sm:grid-cols-2">
			<div>
				<label class={label} for="category">Category</label>
				<select id="category" name="category" class="select mt-1 h-12 w-full field-zine">
					{#each categoryIds as id (id)}
						<option value={id} selected={event?.category === id}>{categories[id].label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class={label} for="currency">Ticket currency</label>
				<select id="currency" name="currency" class="select mt-1 h-12 w-full field-zine" disabled={currencyLocked}>
					{#each Object.entries(currencies) as [code, c] (code)}
						<option value={code} selected={(event?.currency ?? 'usd') === code}>{c.label}</option>
					{/each}
				</select>
				{#if currencyLocked}<input type="hidden" name="currency" value={event?.currency} />{/if}
			</div>
		</div>

		<label class="{label} mt-3" for="description">Description {@html optional}</label>
		<textarea id="description" name="description" maxlength="20000" class="textarea h-48 w-full field-zine" placeholder="What's happening, who it's for, what to bring…" defaultValue={event?.description ?? ''}></textarea>
	</fieldset>

	<fieldset class="fieldset gap-1">
		<legend class="mb-2 text-lg font-medium">Cover image</legend>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
			<img src={preview ?? (event ? coverImage(event) : categories.other.image)} alt="" class="aspect-[2/1] w-full rounded-[10px] border-2 border-espresso object-cover sm:w-56" />
			<div>
				<input
					type="file"
					name="cover"
					accept="image/jpeg,image/png,image/webp"
					class="file-input w-full field-zine"
					onchange={(e) => {
						const file = e.currentTarget.files?.[0];
						preview = file ? URL.createObjectURL(file) : null;
					}}
				/>
				<p class="mt-1 text-xs text-crema">JPG, PNG or WebP, up to 5 MB. Wide images (2:1) look best. Without one, we use a photo for the category.</p>
			</div>
		</div>
	</fieldset>

	<fieldset class="fieldset gap-1">
		<legend class="mb-2 text-lg font-medium">When</legend>
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label class={label} for="starts_at">Starts</label>
				<input id="starts_at" name="starts_at" type="datetime-local" required class="input mt-1 h-12 w-full field-zine" defaultValue={local(event?.starts_at)} />
			</div>
			<div>
				<label class={label} for="ends_at">Ends</label>
				<input id="ends_at" name="ends_at" type="datetime-local" required class="input mt-1 h-12 w-full field-zine" defaultValue={local(event?.ends_at)} />
			</div>
		</div>
		<label class="{label} mt-3" for="timezone">Time zone</label>
		<select id="timezone" name="timezone" class="select h-12 w-full field-zine" bind:value={timezone}>
			{#each timeZones.includes(timezone) ? timeZones : [timezone, ...timeZones] as tz (tz)}
				<option value={tz}>{tz.replaceAll('_', ' ')}</option>
			{/each}
		</select>
	</fieldset>

	<fieldset class="fieldset gap-1">
		<legend class="mb-2 text-lg font-medium">Where</legend>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" name="is_online" class="toggle toggle-primary" bind:checked={isOnline} />
			<span>Online event</span>
		</label>
		{#if !isOnline}
			<label class="{label} mt-3" for="venue_name">Venue</label>
			<input id="venue_name" name="venue_name" maxlength="140" class="input h-12 w-full field-zine" defaultValue={event?.venue_name ?? ''} placeholder="Café, roastery, hall…" />
			<label class="{label} mt-3" for="address">Street address</label>
			<input id="address" name="address" maxlength="300" class="input h-12 w-full field-zine" defaultValue={event?.address ?? ''} />
			<div class="mt-3 grid gap-4 sm:grid-cols-2">
				<div>
					<label class={label} for="city">City</label>
					<input id="city" name="city" maxlength="100" class="input mt-1 h-12 w-full field-zine" defaultValue={event?.city ?? ''} />
				</div>
				<div>
					<label class={label} for="country">Country</label>
					<input id="country" name="country" maxlength="100" class="input mt-1 h-12 w-full field-zine" defaultValue={event?.country ?? ''} />
				</div>
			</div>
		{:else}
			<label class="{label} mt-3" for="online_url">Joining link</label>
			<input id="online_url" name="online_url" type="url" maxlength="500" class="input h-12 w-full field-zine" defaultValue={secret?.online_url ?? ''} placeholder="https://zoom.us/j/…" />
			<p class="text-xs text-crema">Only people with a ticket see this — on their ticket and in their confirmation email.</p>
		{/if}
		<label class="{label} mt-3" for="attendee_info">Info for ticket holders {@html optional}</label>
		<textarea id="attendee_info" name="attendee_info" maxlength="2000" class="textarea h-20 w-full field-zine" placeholder="Door code, parking, what to bring…" defaultValue={secret?.attendee_info ?? ''}></textarea>
		<p class="text-xs text-crema">Private: shown on tickets and in confirmation emails, not on the public page.</p>
	</fieldset>

	<fieldset class="fieldset gap-1">
		<legend class="mb-2 text-lg font-medium">Capacity & policy</legend>
		<label class={label} for="capacity">Total capacity {@html optional}</label>
		<input id="capacity" name="capacity" type="number" min="1" class="input h-12 w-full field-zine sm:w-48" defaultValue={event?.capacity ?? ''} placeholder="No limit" />
		<p class="text-xs text-crema">Caps all ticket types combined, e.g. the size of the room.</p>
		<label class="{label} mt-3" for="refund_policy">Refund policy {@html optional}</label>
		<textarea id="refund_policy" name="refund_policy" maxlength="1000" class="textarea h-20 w-full field-zine" placeholder="e.g. Full refunds up to 7 days before the event." defaultValue={event?.refund_policy ?? ''}></textarea>
	</fieldset>
</div>
