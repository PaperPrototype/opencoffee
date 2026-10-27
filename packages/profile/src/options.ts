/**
 * Coffee CV vocabularies. Mirrors the check constraints on public.profiles
 * (services/database/supabase/migrations/20261024120000_profile_coffee_cv.sql) — add an id there too.
 */

export type Option<Id extends string = string> = { id: Id; label: string; hint?: string };

export const coffeeRoles = [
	{ id: 'barista', label: 'Barista' },
	{ id: 'head_barista', label: 'Head barista' },
	{ id: 'roaster', label: 'Roaster' },
	{ id: 'green_buyer', label: 'Green buyer' },
	{ id: 'producer', label: 'Producer' },
	{ id: 'q_grader', label: 'Q grader' },
	{ id: 'educator', label: 'Educator / trainer' },
	{ id: 'cafe_owner', label: 'Café owner' },
	{ id: 'competitor', label: 'Competitor' },
	{ id: 'judge', label: 'Judge' },
	{ id: 'equipment', label: 'Equipment / tech' },
	{ id: 'writer', label: 'Writer / creator' },
	{ id: 'home_brewer', label: 'Home brewer' },
	{ id: 'enthusiast', label: 'Just love coffee' }
] as const satisfies readonly Option[];

export const availabilityOptions = [
	{ id: 'looking', label: 'Looking for work', hint: 'Show me to people hiring' },
	{ id: 'open', label: 'Open to the right role', hint: 'Not searching, happy to talk' },
	{ id: 'hiring', label: 'Hiring', hint: 'I run a team and need people' },
	{ id: 'not_looking', label: 'Not looking', hint: 'Just here for the community' }
] as const satisfies readonly Option[];

export const interestOptions = [
	{ id: 'jobs', label: 'Coffee jobs', hint: 'Find work or hire' },
	{ id: 'events', label: 'Events', hint: 'Cuppings, throwdowns, festivals' },
	{ id: 'learning', label: 'Learning', hint: 'Courses and guides' },
	{ id: 'competing', label: 'Competing', hint: 'Championships and leagues' },
	{ id: 'hosting', label: 'Hosting', hint: 'Run my own events' },
	{ id: 'community', label: 'Meeting people', hint: 'Coffee people near me' }
] as const satisfies readonly Option[];

export type CoffeeRole = (typeof coffeeRoles)[number]['id'];
export type Availability = (typeof availabilityOptions)[number]['id'];
export type Interest = (typeof interestOptions)[number]['id'];

const labelOf = (options: readonly Option[], id: string | null | undefined) =>
	options.find((o) => o.id === id)?.label ?? null;

export const roleLabel = (id: string) => labelOf(coffeeRoles, id) ?? id;
export const availabilityLabel = (id: string | null | undefined) => labelOf(availabilityOptions, id);

export const LIMITS = {
	displayName: 80,
	headline: 80,
	location: 80,
	bio: 1000,
	roles: 6,
	skills: 12,
	skill: 40,
	experience: 8,
	experienceRole: 80,
	experiencePlace: 80,
	experienceDetail: 280,
	website: 300
} as const;
