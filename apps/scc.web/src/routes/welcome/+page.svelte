<script lang="ts">
	import { ArrowLeft, ArrowRight, Check, Plus, X } from '@lucide/svelte';
	import { AvatarPicker } from 'avatars';
	import { availabilityOptions, coffeeRoles, interestOptions, LIMITS, normalizeInstagram, normalizeWebsite, splitSkills } from 'profile';
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import CoffeeCv from '#lib/components/CoffeeCv.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const steps = [
		{ title: 'The basics', blurb: 'How you show up to other members — here and on the World Espresso Championship.' },
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

	const label = 'block font-mono text-[11px] tracking-[0.14em] text-crema uppercase';
	const optional = 'float-right tracking-normal normal-case opacity-70';
	const pill =
		'cursor-pointer rounded-full border-2 border-espresso bg-base-100 px-3.5 py-1.5 text-sm font-medium transition-colors select-none hover:bg-base-300 has-checked:bg-espresso has-checked:text-paper has-disabled:opacity-40 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary';
	const tile =
		'flex cursor-pointer items-start gap-3 rounded-[12px] border-2 border-espresso bg-base-100 p-3.5 transition-[box-shadow,background-color] hover:bg-base-300 has-checked:bg-base-300 has-checked:shadow-zine-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary';
</script>

<svelte:head>
	<title>{editing ? 'Edit your Coffee CV' : 'Welcome'} — Specialty Coffee Community</title>
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<SiteHeader />

<main>
	<section class="border-b-2 border-espresso">
		<div class="mx-auto max-w-[1344px] px-6 pt-12 pb-10 md:px-8 md:pt-16 md:pb-14">
			<p class="eyebrow">{editing ? 'Your Coffee CV' : 'Welcome to the community'}</p>
			<h1 class="display mt-4 max-w-[15ch] text-[44px] leading-[1.02] font-semibold tracking-[-0.035em] md:text-[68px]">
				Your coffee work, <span class="text-primary italic">ready to be seen.</span>
			</h1>
			<p class="mt-5 max-w-[56ch] text-roast">
				{editing
					? 'Update your Coffee CV. Changes show on your member page as soon as you save.'
					: 'Four quick steps to your Coffee CV — the profile other members, hosts and employers see. Only your name is required, and you can change everything later.'}
			</p>
		</div>
	</section>

	<section class="mx-auto grid max-w-[1344px] items-start gap-10 px-6 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-16">
		<form
			bind:this={formEl}
			method="POST"
			action="?/save{nextQuery}"
			class="scroll-mt-28 card-zine p-6 sm:p-8"
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
							<span class="block h-2 rounded-full border-2 border-espresso {i < step ? 'bg-espresso' : i === step ? 'bg-primary' : 'bg-base-100'}"></span>
							<span class="mt-2 hidden font-mono text-[10px] tracking-[0.1em] uppercase sm:block {i === step ? 'text-espresso' : 'text-crema'} {i < step ? 'group-hover:text-primary' : ''}">
								{s.title}
							</span>
						</button>
					</li>
				{/each}
			</ol>

			<div class="mt-7 border-b-2 border-line pb-5">
				<p class="font-mono text-[11px] tracking-[0.14em] text-primary uppercase">Step {step + 1} of {steps.length}</p>
				<h2 class="display mt-1 text-[30px] leading-tight font-semibold tracking-[-0.03em]">{steps[step].title}</h2>
				<p class="mt-1 text-[15px] text-roast">{steps[step].blurb}</p>
			</div>

			{#if form?.message}
				<div role="alert" class="mt-5 rounded-[10px] border-2 border-error bg-error/10 px-4 py-3 text-sm text-error">{form.message}</div>
			{/if}

			<!-- All steps stay in the form (hidden, not removed) so one submit saves everything. -->
			<fieldset data-step="0" hidden={step !== 0} class="mt-6 grid gap-5">
				<AvatarPicker userId={data.userId} icon={start.avatar_icon} hue={start.avatar_hue} />
				<label class="block">
					<span class={label}>Display name</span>
					<input name="display_name" required maxlength={LIMITS.displayName} autocomplete="name" bind:value={name} class="input mt-2 h-12 w-full field-zine" placeholder="Daniel Ortega" />
				</label>
				<label class="block">
					<span class={label}>Coffee role <span class={optional}>One line</span></span>
					<input name="headline" maxlength={LIMITS.headline} bind:value={headline} class="input mt-2 h-12 w-full field-zine" placeholder="Barista & coffee educator" />
				</label>
				<label class="block">
					<span class={label}>Location <span class={optional}>City, country</span></span>
					<input name="location" maxlength={LIMITS.location} autocomplete="address-level2" bind:value={location} class="input mt-2 h-12 w-full field-zine" placeholder="Medellín, Colombia" />
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
					<input name="years_in_coffee" type="number" inputmode="numeric" min="0" max="80" step="1" bind:value={years} class="input mt-2 h-12 w-full field-zine" placeholder="0" />
				</label>
				<label class="block">
					<span class={label}>Skills <span class={optional}>Separate with commas</span></span>
					<input name="skills" maxlength="600" bind:value={skills} class="input mt-2 h-12 w-full field-zine" placeholder="Espresso workflow, latte art, sensory, team training" />
					<span class="mt-1.5 block text-xs text-crema">Up to {LIMITS.skills}. They show as tags on your CV.</span>
				</label>
			</fieldset>

			<fieldset data-step="2" hidden={step !== 2} class="mt-6 grid gap-6">
				<label class="block">
					<span class={label}>About your work <span class={optional}>{bio.length}/{LIMITS.bio}</span></span>
					<textarea name="bio" maxlength={LIMITS.bio} rows="4" bind:value={bio} class="textarea mt-2 w-full field-zine text-[15px]" placeholder="I make busy bars feel calm, explain coffee without the theatre and help new baristas trust their palate."></textarea>
				</label>

				<div>
					<p class={label}>Experience <span class={optional}>Most recent first</span></p>
					<ul class="mt-3 grid gap-3">
						{#each experience as job, i (job)}
							<li class="relative rounded-[12px] border-2 border-espresso bg-base-200 p-4">
								<div class="grid gap-3 sm:grid-cols-2">
									<input name="exp_role" aria-label="Role {i + 1}" maxlength={LIMITS.experienceRole} required={!!(job.place || job.detail)} bind:value={job.role} class="input h-11 w-full field-zine" placeholder="Senior barista" />
									<input name="exp_place" aria-label="Place {i + 1}" maxlength={LIMITS.experiencePlace} required={!!(job.role || job.detail)} bind:value={job.place} class="input h-11 w-full field-zine" placeholder="Neighbourhood café, Medellín" />
								</div>
								<input name="exp_detail" aria-label="What you did {i + 1}" maxlength={LIMITS.experienceDetail} bind:value={job.detail} class="input mt-3 h-11 w-full field-zine" placeholder="What you did there (optional)" />
								{#if experience.length > 1}
									<button
										type="button"
										class="absolute -top-3 -right-3 grid size-7 place-items-center rounded-full border-2 border-espresso bg-base-100 hover:bg-error hover:text-error-content"
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
						<button type="button" class="link-zine mt-4 text-sm" onclick={() => experience.push(blank())}>
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
								<span><span class="block text-[15px] font-semibold">{option.label}</span><span class="text-sm text-roast">{option.hint}</span></span>
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
								<span><span class="block text-[15px] font-semibold">{option.label}</span><span class="text-sm text-roast">{option.hint}</span></span>
							</label>
						{/each}
					</div>
				</div>
				<div class="grid gap-5 sm:grid-cols-2">
					<label class="block">
						<span class={label}>Website <span class={optional}>Optional</span></span>
						<input name="website" inputmode="url" maxlength={LIMITS.website} bind:value={website} class="input mt-2 h-12 w-full field-zine" placeholder="yourcafe.com" />
					</label>
					<label class="block">
						<span class={label}>Instagram <span class={optional}>Optional</span></span>
						<input name="instagram" maxlength="60" bind:value={instagram} class="input mt-2 h-12 w-full field-zine" placeholder="@handle" />
					</label>
				</div>
			</fieldset>

			<div class="mt-8 flex flex-wrap items-center gap-3 border-t-2 border-line pt-6">
				{#if step > 0}
					<button type="button" class="btn btn-zine bg-base-100" onclick={() => go(step - 1)}><ArrowLeft class="size-4" /> Back</button>
				{/if}
				<button type="submit" class="btn ml-auto btn-primary btn-zine" disabled={pending}>
					{#if pending}<span class="loading loading-sm loading-spinner"></span>{/if}
					{#if step < last}Continue <ArrowRight class="size-4" />{:else}<Check class="size-4" /> {editing ? 'Save changes' : 'Save my Coffee CV'}{/if}
				</button>
			</div>
			{#if !editing}
				<p class="mt-5 text-center text-sm text-roast">
					<button type="submit" formaction="?/skip{nextQuery}" formnovalidate class="underline decoration-primary underline-offset-4 hover:text-primary">
						Skip for now
					</button>
					— you can finish your CV from your account.
				</p>
			{/if}
		</form>

		<div class="lg:sticky lg:top-28" aria-live="polite">
			<p class="mb-4 font-mono text-[11px] tracking-[0.14em] text-crema uppercase">Live preview · saved when you finish</p>
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
				strip={['Public Coffee CV', editing ? 'Unsaved changes' : 'Draft']}
			/>
			<p class="mt-5 text-sm text-roast">
				Your CV is visible to signed-in members. Email and account details are never shown.
			</p>
		</div>
	</section>
</main>

<SiteFooter />
