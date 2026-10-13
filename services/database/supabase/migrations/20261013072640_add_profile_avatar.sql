-- Profile picture: one of the coffee icons in packages/avatars plus a color hue.
-- Both null until the member picks; the apps then show a default derived from user_id.

alter table public.profiles
	-- An icon id from packages/avatars/src/icons.ts (validated there; kept loose here so new
	-- icons don't need a migration).
	add column avatar_icon text check (avatar_icon ~ '^[a-z0-9-]{1,32}$'),
	add column avatar_hue smallint check (avatar_hue between 0 and 359);

grant update (avatar_icon, avatar_hue) on public.profiles to authenticated;
