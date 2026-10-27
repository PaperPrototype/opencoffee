-- Coffee CV: richer profile details collected during onboarding and shown to other members.
--
-- Fixed vocabularies (roles, availability, interests) are plain text checked against a list rather
-- than enums, so adding an option is one `alter ... check` instead of an enum migration. The lists
-- mirror packages/profile/src/options.ts.

-- Experience entries are [{ "role": text, "place": text, "detail": text? }, ...], newest first.
create function public.is_valid_experience(p_experience jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
	select jsonb_typeof(p_experience) = 'array'
		and jsonb_array_length(p_experience) <= 8
		and not exists (
			select 1 from jsonb_array_elements(p_experience) e
			where jsonb_typeof(e) <> 'object'
				-- coalesce: a missing key gives null, which would otherwise slip through.
				or coalesce(jsonb_typeof(e -> 'role'), '') <> 'string'
				or char_length(e ->> 'role') not between 1 and 80
				or coalesce(jsonb_typeof(e -> 'place'), '') <> 'string'
				or char_length(e ->> 'place') not between 1 and 80
				or (e ? 'detail' and (jsonb_typeof(e -> 'detail') <> 'string' or char_length(e ->> 'detail') > 280))
		);
$$;

alter table public.profiles
	-- "Head barista & trainer" — the one-liner under the name.
	add column headline text check (char_length(headline) <= 80),
	-- Free text, e.g. "Medellín, Colombia".
	add column location text check (char_length(location) <= 80),
	-- ISO 3166-1 alpha-2, for flags and filtering.
	add column country_code text check (country_code ~ '^[A-Z]{2}$'),
	add column roles text[] not null default '{}' check (
		cardinality(roles) <= 6
		and roles <@ array[
			'barista', 'head_barista', 'roaster', 'green_buyer', 'producer', 'q_grader', 'educator',
			'cafe_owner', 'competitor', 'judge', 'equipment', 'writer', 'home_brewer', 'enthusiast'
		]
	),
	add column years_in_coffee smallint check (years_in_coffee between 0 and 80),
	-- Short tags ("Espresso workflow", "Latte art"). Validated per item below.
	add column skills text[] not null default '{}' check (cardinality(skills) <= 12),
	add column experience jsonb not null default '[]' check (public.is_valid_experience(experience)),
	add column availability text check (availability in ('not_looking', 'open', 'looking', 'hiring')),
	-- What they joined for; drives what the apps surface first.
	add column interests text[] not null default '{}' check (
		interests <@ array['jobs', 'events', 'learning', 'competing', 'hosting', 'community']
	),
	add column website text check (char_length(website) <= 300 and website ~ '^https?://'),
	add column instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
	-- When the member finished (or skipped) onboarding; null = show the welcome flow.
	add column onboarded_at timestamptz;

-- Each skill: 1–40 chars. (Checks can't contain subqueries, so this goes through a function.)
create function public.is_valid_skills(p_skills text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
	select not exists (select 1 from unnest(p_skills) s where char_length(s) not between 1 and 40);
$$;

alter table public.profiles add constraint profiles_skills_valid check (public.is_valid_skills(skills));

comment on column public.profiles.headline is 'One-line coffee role shown under the name, e.g. "Head barista & trainer".';
comment on column public.profiles.experience is 'Coffee CV work history: [{role, place, detail?}], newest first, at most 8.';
comment on column public.profiles.onboarded_at is 'When the member finished or skipped onboarding. Null means the welcome flow is still due.';

grant update (
	headline, location, country_code, roles, years_in_coffee, skills, experience, availability,
	interests, website, instagram, onboarded_at
) on public.profiles to authenticated;

-- Directory view: add the public Coffee CV fields (appended, so `create or replace` keeps working).
-- interests and onboarded_at stay private to the member.
create or replace view public.members
with (security_invoker = false)
as
select
	id,
	user_id,
	member_number,
	display_name,
	bio,
	avatar_icon,
	avatar_hue,
	created_at,
	public.member_badge(member_number) as badge,
	headline,
	location,
	country_code,
	roles,
	years_in_coffee,
	skills,
	experience,
	availability,
	website,
	instagram
from public.profiles;

revoke all on public.members from anon, authenticated;
grant select on public.members to authenticated;

-- Directory filters on roles.
create index profiles_roles_idx on public.profiles using gin (roles);
