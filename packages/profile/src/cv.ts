import {
	availabilityOptions,
	coffeeRoles,
	interestOptions,
	LIMITS,
	type Availability,
	type CoffeeRole,
	type Interest
} from './options.js';

export type ExperienceEntry = { role: string; place: string; detail?: string };

/** The Coffee CV columns of public.profiles, as the onboarding form edits them. */
export type CoffeeCv = {
	display_name: string | null;
	headline: string | null;
	location: string | null;
	bio: string | null;
	roles: CoffeeRole[];
	years_in_coffee: number | null;
	skills: string[];
	experience: ExperienceEntry[];
	availability: Availability | null;
	interests: Interest[];
	website: string | null;
	instagram: string | null;
};

const text = (form: FormData, name: string, max: number) =>
	String(form.get(name) ?? '').trim().slice(0, max) || null;

const pick = <T extends string>(values: FormDataEntryValue[], allowed: readonly { id: T }[]) => {
	const ids = new Set<string>(allowed.map((o) => o.id));
	return [...new Set(values.map(String))].filter((v): v is T => ids.has(v));
};

/** "Espresso, latte art,, cupping" → ["Espresso", "Latte art", "Cupping"] (deduped, capped). */
export function splitSkills(raw: string) {
	const seen = new Set<string>();
	const skills: string[] = [];
	for (const part of raw.split(/[,\n]/)) {
		const skill = part.trim().replace(/\s+/g, ' ').slice(0, LIMITS.skill);
		const key = skill.toLowerCase();
		if (!skill || seen.has(key)) continue;
		seen.add(key);
		skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
		if (skills.length === LIMITS.skills) break;
	}
	return skills;
}

/** Accepts "@handle", "handle" or an instagram.com URL. */
export function normalizeInstagram(raw: string) {
	const handle = raw
		.trim()
		.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
		.replace(/^@/, '')
		.replace(/[/?#].*$/, '');
	return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
}

/** Adds https:// to a bare domain; null when it still isn't a URL. */
export function normalizeWebsite(raw: string) {
	const value = raw.trim();
	if (!value) return null;
	const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	try {
		const parsed = new URL(url);
		return parsed.hostname.includes('.') && url.length <= LIMITS.website ? url : null;
	} catch {
		return null;
	}
}

/**
 * Reads the onboarding / Coffee CV form. Experience rows come in as parallel `exp_role`,
 * `exp_place`, `exp_detail` fields; half-filled rows are an error so nothing is silently dropped.
 */
export function parseCoffeeCv(form: FormData): { cv: CoffeeCv } | { message: string } {
	const roles = pick(form.getAll('roles'), coffeeRoles);
	if (roles.length > LIMITS.roles) return { message: `Pick up to ${LIMITS.roles} roles.` };

	const yearsRaw = String(form.get('years_in_coffee') ?? '').trim();
	const years = yearsRaw === '' ? null : Number(yearsRaw);
	if (years !== null && (!Number.isInteger(years) || years < 0 || years > 80)) {
		return { message: 'Years in coffee should be a whole number.' };
	}

	const expRoles = form.getAll('exp_role').map((v) => String(v).trim());
	const expPlaces = form.getAll('exp_place').map((v) => String(v).trim());
	const expDetails = form.getAll('exp_detail').map((v) => String(v).trim());
	const experience: ExperienceEntry[] = [];
	for (let i = 0; i < expRoles.length; i++) {
		const role = expRoles[i].slice(0, LIMITS.experienceRole);
		const place = (expPlaces[i] ?? '').slice(0, LIMITS.experiencePlace);
		const detail = (expDetails[i] ?? '').slice(0, LIMITS.experienceDetail);
		if (!role && !place && !detail) continue;
		if (!role || !place) return { message: 'Each experience needs a role and a place.' };
		experience.push(detail ? { role, place, detail } : { role, place });
	}
	if (experience.length > LIMITS.experience) {
		return { message: `Add up to ${LIMITS.experience} experiences.` };
	}

	const websiteRaw = String(form.get('website') ?? '');
	const website = normalizeWebsite(websiteRaw);
	if (websiteRaw.trim() && !website) return { message: 'That website link doesn’t look right.' };

	const instagramRaw = String(form.get('instagram') ?? '');
	const instagram = instagramRaw.trim() ? normalizeInstagram(instagramRaw) : null;
	if (instagramRaw.trim() && !instagram) return { message: 'That Instagram handle doesn’t look right.' };

	return {
		cv: {
			display_name: text(form, 'display_name', LIMITS.displayName),
			headline: text(form, 'headline', LIMITS.headline),
			location: text(form, 'location', LIMITS.location),
			bio: text(form, 'bio', LIMITS.bio),
			roles,
			years_in_coffee: years,
			skills: splitSkills(String(form.get('skills') ?? '')),
			experience,
			availability: pick([form.get('availability') ?? ''], availabilityOptions)[0] ?? null,
			interests: pick(form.getAll('interests'), interestOptions),
			website,
			instagram
		}
	};
}

/** Experience from the jsonb column, tolerating anything malformed. */
export function readExperience(value: unknown): ExperienceEntry[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((e) =>
		e && typeof e === 'object' && typeof e.role === 'string' && typeof e.place === 'string'
			? [{ role: e.role, place: e.place, ...(typeof e.detail === 'string' && e.detail ? { detail: e.detail } : {}) }]
			: []
	);
}

