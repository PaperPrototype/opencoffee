-- Profiles: one row per auth user, shared by every site (SCC, WEC, ...) on this project.

create table public.profiles (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null unique references auth.users (id) on delete cascade,
	display_name text check (char_length(display_name) <= 80),
	avatar_url text,
	bio text check (char_length(bio) <= 1000),
	-- Which site the account was created on ('scc' | 'wec'); set once from sign-up metadata.
	signup_site text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile details for each auth user, shared across all sites.';

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
	on public.profiles for select
	to authenticated
	using ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
	on public.profiles for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

-- Rows are created by the trigger below, never directly by clients, and only the
-- editable details can change (user_id and signup_site are fixed at sign-up).
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, avatar_url, bio) on public.profiles to authenticated;

-- Keep updated_at current.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger profiles_set_updated_at
	before update on public.profiles
	for each row execute function public.set_updated_at();

-- Create a profile whenever a user signs up, on any site.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.profiles (user_id, display_name, signup_site)
	values (
		new.id,
		nullif(new.raw_user_meta_data ->> 'display_name', ''),
		new.raw_user_meta_data ->> 'signup_site'
	);
	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();
