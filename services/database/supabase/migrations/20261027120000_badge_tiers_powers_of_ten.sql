-- Early-member badges become founding-class tiers in powers of ten:
--   #1–100       first_100     "The Founding Hundred"
--   #101–1000    first_1000    "The First Thousand"
--   #1001–10000  first_10000   "The First Ten Thousand"
-- founding_10 folds into first_100. Badges are still derived from the member number, so the members
-- view picks this up without a backfill.

create or replace function public.member_badge(p_member_number bigint)
returns text
language sql
immutable
set search_path = ''
as $$
	select case
		when p_member_number <= 100 then 'first_100'
		when p_member_number <= 1000 then 'first_1000'
		when p_member_number <= 10000 then 'first_10000'
	end;
$$;
