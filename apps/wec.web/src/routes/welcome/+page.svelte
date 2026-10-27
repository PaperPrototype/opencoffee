<script lang="ts">
	import { ArrowLeft, ArrowRight, Check, Plus, X } from '@lucide/svelte';
	import { AvatarPicker } from 'avatars';
	import { availabilityOptions, coffeeRoles, interestOptions, LIMITS, normalizeInstagram, normalizeWebsite, splitSkills } from 'profile';
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const steps = [
		{ title: 'The basics', blurb: 'How you show up to other members — here and on Specialty Coffee Community.' },
		{ title: 'Your coffee', blurb: 'What you do, how long you’ve done it and what you’re good at.' },
		{ title: 'Your story', blurb: 'A few lines on how you work, and where you’ve worked. All optional.' },
		{ title: 'What you’re here for', blurb: 'So we show you the right things first. Change it any time.' }
	];
	const last = steps.length - 1;

	// The saved profile is only the starting point; after that the form owns the values.
	const start = untrack(() => data.profile);
	const editing = !!start.onboarded_at;

	// ?step=3 opens a later step directly — but only once the required name is there.
	const requested = Math.min(last, Math.max(0, Number(page.url.searchParams.get('step') ?? 1) - 1 || 0));
	let step = $state(start.display_name ? requested : 0);
	let name = $state(start.display_name ?? '');
	let headline = $state(start.headline ?? '');
	let location = $state(start.location ?? '');
	let avatarIcon = $state(start.avatar_icon);
	let avatarHue = $state(start.avatar_hue);
	let roles = $state<string[]>([...start.roles]);
	let years = $state(start.years_in_coffee?.toString() ?? '');
	let skills = $state(start.skills.join(', '));
	let bio = $state(start.bio ?? '');
	const blank = () => ({ role: '', place: '', detail: '' });
	let experience = $state(start.experience.length ? start.experience.map((e) => ({ detail: '', ...e })) : [blank()]);
	let availability = $state(start.availability ?? '');
	let interests = $state<string[]>([...start.interests]);
	let website = $state(start.website ?? '');
	let instagram = $state(start.instagram ?? '');

	const preview = $derived({
		skills: splitSkills(skills),
		experience: experience
			.filter((e) => e.role.trim() && e.place.trim())
			.map((e) => ({ role: e.role.trim(), place: e.place.trim(), detail: e.detail.trim() || undefined })),
		years: years === '' || !Number.isInteger(Number(years)) ? null : Number(years),
		website: normalizeWebsite(website),
		instagram: instagram.trim() ? normalizeInstagram(instagram) : null
	});

	const next = page.url.searchParams.get('next');
	const nextQuery = next ? `&next=${encodeURIComponent(next)}` : '';

	let formEl: HTMLFormElement;
	let pending = $state(false);

	/** Moving forward checks the current step's fields first, so errors show where they are. */
	function go(to: number) {
		if (to > step) {
			const fields = formEl.querySelectorAll<HTMLInputElement>(`[data-step="${step}"] :is(input, textarea)`);
			for (const field of fields) {
				if (!field.checkValidity()) return field.reportValidity();
			}
		}
		step = to;
		formEl.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}

	// The avatar picker owns its inputs; mirror them into the preview as they change.
	function oninput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.name === 'avatar_icon') avatarIcon = target.value;
		if (target.name === 'avatar_hue') avatarHue = Number(target.value);
	}

	const label = 'block text-[10px] font-extrabold tracking-[0.25em] text-sand/50 uppercase';
	const optional = 'float-right tracking-normal normal-case opacity-70';
	const pill =
		'cursor-pointer rounded-full bg-sand/5 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-sand/20 transition-colors select-none hover:bg-sand/10 has-checked:bg-copper has-checked:text-espresso has-checked:ring-copper has-disabled:opacity-40 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-copper';
	const tile =
		'flex cursor-pointer items-start gap-3 rounded-xl bg-base-200 p-3.5 ring-1 ring-sand/10 transition-colors hover:bg-sand/5 has-checked:bg-copper/10 has-checked:ring-copper/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-copper';
</script>

<svelte:head>
	<title>{editing ? 'Edit your Coffee CV' : 'Welcome'} | World Espresso Championship</title>
</svelte:head>

<SiteNav />

<main>
	<section>
		<div class="mx-auto max-w-6xl px-4 pt-14 pb-4 md:pt-20">
			<p class="eyebrow">{editing ? 'Your SCC Coffee CV' : 'Welcome to WEC'}</p>
			<h1 class="mt-4 max-w-[18ch] text-4xl font-extrabold tracking-tight sm:text-6xl">
				Your coffee work, <span class="text-copper">ready to be seen.</span>
			</h1>
			<p class="mt-5 max-w-[60ch] text-sand/70">
				{editing
					? 'Update your Coffee CV. It’s part of your Specialty Coffee Community account, so changes show on both sites.'
					: 'Four quick steps to your Coffee CV — the profile competitors, judges and organizers see across WEC and Specialty Coffee Community. Only your name is required.'}
			</p>
		</div>
	</section>

	<section class="mx-auto grid max-w-6xl items-start gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20">
		<form
			bind:this={formEl}
			method="POST"
			action="?/save{nextQuery}"
			class="scroll-mt-24 card-board p-6 sm:p-8"
			{oninput}
			use:enhance={({ submitter, cancel }) => {
				// Enter (or Continue) on an earlier step moves on instead of saving.
				const skipping = submitter?.getAttribute('formaction')?.startsWith('?/skip');
				if (!skipping && step < last) {
					cancel();
					go(step + 1);
					return;
				}
				pending = true;
				return async ({ update }) => {
					await update({ reset: false });
					pending = false;
				};
			}}
		>
			<!-- Progress: finished steps can be revisited -->
			<ol class="grid grid-cols-4 gap-2" aria-label="Steps">
				{#each steps as s, i (s.title)}
					<li>
						<button
							type="button"
							class="group block w-full text-left disabled:cursor-default"
							disabled={i > step}
							aria-current={i === step ? 'step' : undefined}
							onclick={() => go(i)}
						>
							<span class="block h-1.5 rounded-full {i < step ? 'bg-copper/60' : i === step ? 'bg-copper' : 'bg-sand/10'}"></span>
							<span class="mt-2 hidden text-[10px] font-extrabold tracking-[0.2em] uppercase sm:block {i === step ? 'text-sand' : 'text-sand/40'} {i < step ? 'group-hover:text-cinnamon-light' : ''}">
								{s.title}
							</span>
						</button>
					</li>
				{/each}
			</ol>

			<div class="mt-7 border-b border-sand/10 pb-5">
				<p class="eyebrow">Step {step + 1} of {steps.length}</p>
				<h2 class="mt-2 text-2xl font-extrabold tracking-tight">{steps[step].title}</h2>
				<p class="mt-1 text-sm text-sand/60">{steps[step].blurb}</p>
			</div>

			{#if form?.message}
				<div role="alert" class="mt-5 alert alert-soft text-sm alert-error">{form.message}</div>
			{/if}

			<!-- All steps stay in the form (hidden, not removed) so one submit saves everything. -->
			<fieldset data-step="0" hidden={step !== 0} class="mt-6 grid gap-5">
				<AvatarPicker userId={data.userId} icon={start.avatar_icon} hue={start.avatar_hue} />
				<label class="block">
					<span class={label}>Display name</span>
					<input name="display_name" required maxlength={LIMITS.displayName} autocomplete="name" bind:value={name} class="input mt-2 h-12 w-full rounded-lg" placeholder="Daniel Ortega" />
				</label>
				<label class="block">
					<span class={label}>Coffee role <span class={optional}>One line</span></span>
					<input name="headline" maxlength={LIMITS.headline} bind:value={headline} class="input mt-2 h-12 w-full rounded-lg" placeholder="Barista & coffee educator" />
				</label>
				<label class="block">
					<span class={label}>Location <span class={optional}>City, country</span></span>
					<input name="location" maxlength={LIMITS.location} autocomplete="address-level2" bind:value={location} class="input mt-2 h-12 w-full rounded-lg" placeholder="Medellín, Colombia" />
				</label>
			</fieldset>

			<fieldset data-step="1" hidden={step !== 1} class="mt-6 grid gap-6">
				<div>
					<p class={label}>What do you do in coffee? <span class={optional}>Up to {LIMITS.roles}</span></p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each coffeeRoles as role (role.id)}
							<label class={pill}>
								<input
									type="checkbox"
									name="roles"
									value={role.id}
									bind:group={roles}
									disabled={roles.length >= LIMITS.roles && !roles.includes(role.id)}
									class="sr-only"
								/>
								{role.label}
							</label>
						{/each}
					</div>
				</div>
				<label class="block max-w-[200px]">
					<span class={label}>Years in coffee</span>
					<input name="years_in_coffee" type="number" inputmode="numeric" min="0" max="80" step="1" bind:value={years} class="input mt-2 h-12 w-full rounded-lg" placeholder="0" />
				</label>
				<label class="block">
					<span class={label}>Skills <span class={optional}>Separate with commas</span></span>
					<input name="skills" maxlength="600" bind:value={skills} class="input mt-2 h-12 w-full rounded-lg" placeholder="Espresso workflow, latte art, sensory, team training" />
					<span class="mt-1.5 block text-xs text-sand/50">Up to {LIMITS.skills}. They show as tags on your CV.</span>
				</label>
			</fieldset>

			<fieldset data-step="2" hidden={step !== 2} class="mt-6 grid gap-6">
				<label class="block">
					<span class={label}>About your work <span class={optional}>{bio.length}/{LIMITS.bio}</span></span>
					<textarea name="bio" maxlength={LIMITS.bio} rows="4" bind:value={bio} class="textarea mt-2 w-full rounded-lg text-[15px]" placeholder="I make busy bars feel calm, explain coffee without the theatre and help new baristas trust their palate."></textarea>
				</label>

				<div>
					<p class={label}>Experience <span class={optional}>Most recent first</span></p>
					<ul class="mt-3 grid gap-3">
						{#each experience as job, i (job)}
							<li class="relative rounded-xl bg-base-200 p-4 ring-1 ring-sand/10">
								<div class="grid gap-3 sm:grid-cols-2">
									<input name="exp_role" aria-label="Role {i + 1}" maxlength={LIMITS.experienceRole} required={!!(job.place || job.detail)} bind:value={job.role} class="input h-11 w-full rounded-lg" placeholder="Senior barista" />
									<input name="exp_place" aria-label="Place {i + 1}" maxlength={LIMITS.experiencePlace} required={!!(job.role || job.detail)} bind:value={job.place} class="input h-11 w-full rounded-lg" placeholder="Neighbourhood café, Medellín" />
								</div>
								<input name="exp_detail" aria-label="What you did {i + 1}" maxlength={LIMITS.experienceDetail} bind:value={job.detail} class="input mt-3 h-11 w-full rounded-lg" placeholder="What you did there (optional)" />
								{#if experience.length > 1}
									<button
										type="button"
										class="absolute -top-2.5 -right-2.5 grid size-7 place-items-center rounded-full bg-base-300 ring-1 ring-sand/20 hover:bg-error hover:text-error-content"
										aria-label="Remove experience {i + 1}"
										onclick={() => experience.splice(i, 1)}
									>
										<X class="size-3.5" />
									</button>
								{/if}
							</li>
						{/each}
					</ul>
					{#if experience.length < LIMITS.experience}
						<button type="button" class="mt-4 flex items-center gap-1.5 text-sm font-semibold text-cinnamon-light hover:text-sand" onclick={() => experience.push(blank())}>
							<Plus class="size-4" /> Add another
						</button>
					{/if}
				</div>
			</fieldset>

			<fieldset data-step="3" hidden={step !== 3} class="mt-6 grid gap-6">
				<div>
					<p class={label}>Work status</p>
					<div class="mt-3 grid gap-2 sm:grid-cols-2">
						{#each availabilityOptions as option (option.id)}
							<label class={tile}>
								<input type="radio" name="availability" value={option.id} bind:group={availability} class="radio mt-0.5 radio-sm radio-primary" />
								<span><span class="block text-[15px] font-semibold">{option.label}</span><span class="text-sm text-sand/55">{option.hint}</span></span>
							</label>
						{/each}
					</div>
				</div>
				<div>
					<p class={label}>I’m here for <span class={optional}>Pick any</span></p>
					<div class="mt-3 grid gap-2 sm:grid-cols-2">
						{#each interestOptions as option (option.id)}
							<label class={tile}>
								<input type="checkbox" name="interests" value={option.id} bind:group={interests} class="checkbox mt-0.5 checkbox-sm checkbox-primary" />
								<span><span class="block text-[15px] font-semibold">{option.label}</span><span class="text-sm text-sand/55">{option.hint}</span></span>
							</label>
						{/each}
					</div>
				</div>
				<div class="grid gap-5 sm:grid-cols-2">
					<label class="block">
						<span class={label}>Website <span class={optional}>Optional</span></span>
						<input name="website" inputmode="url" maxlength={LIMITS.website} bind:value={website} class="input mt-2 h-12 w-full rounded-lg" placeholder="yourcafe.com" />
					</label>
					<label class="block">
						<span class={label}>Instagram <span class={optional}>Optional</span></span>
						<input name="instagram" maxlength="60" bind:value={instagram} class="input mt-2 h-12 w-full rounded-lg" placeholder="@handle" />
					</label>
				</div>
			</fieldset>

			<div class="mt-8 flex flex-wrap items-center gap-3 border-t border-sand/10 pt-6">
				{#if step > 0}
					<button type="button" class="btn rounded-lg border-sand/20 bg-transparent text-sand btn-outline hover:bg-sand/10" onclick={() => go(step - 1)}><ArrowLeft class="size-4" /> Back</button>
				{/if}
				<button type="submit" class="btn ml-auto rounded-lg btn-secondary" disabled={pending}>
					{#if pending}<span class="loading loading-sm loading-spinner"></span>{/if}
					{#if step < last}Continue <ArrowRight class="size-4" />{:else}<Check class="size-4" /> {editing ? 'Save changes' : 'Save my Coffee CV'}{/if}
				</button>
			</div>
			{#if !editing}
				<p class="mt-5 text-center text-sm text-sand/55">
					<button type="submit" formaction="?/skip{nextQuery}" formnovalidate class="text-cinnamon-light underline underline-offset-2 hover:text-sand">
						Skip for now
					</button>
					— you can finish it from your account.
				</p>
			{/if}
		</form>

		<div class="lg:sticky lg:top-24" aria-live="polite">
			<p class="label-muted mb-4">Live preview · saved when you finish</p>
			<CoffeeCv
				userId={data.userId}
				memberNumber={data.profile.member_number}
				{name}
				{headline}
				{location}
				{avatarIcon}
				{avatarHue}
				{bio}
				{roles}
				yearsInCoffee={preview.years}
				skills={preview.skills}
				experience={preview.experience}
				{availability}
				website={preview.website}
				instagram={preview.instagram}
				note={editing ? 'Unsaved changes' : 'Draft'}
			/>
			<p class="mt-5 text-sm text-sand/55">
				Your CV is visible to signed-in SCC members. Email and account details are never shown.
			</p>
		</div>
	</section>
</main>

