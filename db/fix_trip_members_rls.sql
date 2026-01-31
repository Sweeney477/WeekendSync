-- COMPREHENSIVE SECURITY REPAIR: Fixing RLS Recursion & Visibility

-- 1. Drop ALL potentially conflicting policies to ensure a clean state
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_select_members" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;

drop policy if exists "trips_select_members" on public.trips;
drop policy if exists "trips_insert_creator" on public.trips;
drop policy if exists "trips_update_organizer" on public.trips;
drop policy if exists "trips_select_creator" on public.trips;
drop policy if exists "trips_insert_policy" on public.trips;

drop policy if exists "trip_members_select_members" on public.trip_members;
drop policy if exists "trip_members_insert_by_functions" on public.trip_members;
drop policy if exists "trip_members_select_own" on public.trip_members;
drop policy if exists "trip_members_select_via_trip" on public.trip_members;
drop policy if exists "trip_members_insert_policy" on public.trip_members;

-- 2. Profiles: Allow only shared-trip access + public view for display names
drop view if exists public.public_profiles;
create view public.public_profiles as
select id, display_name
from public.profiles;
grant select on public.public_profiles to authenticated;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_select_shared_trip" on public.profiles
  for select to authenticated
  using (
    exists (
      select 1
      from public.trip_members tm_self
      join public.trip_members tm_other on tm_other.trip_id = tm_self.trip_id
      where tm_self.user_id = auth.uid()
        and tm_other.user_id = profiles.id
    )
  );
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

-- 3. Trips: Ensure creator can always see their own trip (NO RECURSION)
create policy "trips_select_creator" on public.trips for select using (created_by = auth.uid());
create policy "trips_select_members" on public.trips for select using (public.is_trip_member(id));
create policy "trips_insert_policy" on public.trips for insert with check (created_by = auth.uid());
create policy "trips_update_organizer" on public.trips for update using (public.is_trip_organizer(id));

-- 4. Trip Members: AVOID RECURSION (Do not call is_trip_member here)
create policy "trip_members_select_own" on public.trip_members for select using (user_id = auth.uid());
-- Allow seeing other members if you can see the trip itself
create policy "trip_members_select_via_trip" on public.trip_members for select 
  using (exists (select 1 from public.trips t where t.id = trip_id));
create policy "trip_members_insert_policy" on public.trip_members for insert with check (true);

-- 5. Grant absolute necessary permissions to authenticated role
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all functions in schema public to authenticated;
grant execute on function public.is_trip_member(uuid) to authenticated;
grant execute on function public.is_trip_organizer(uuid) to authenticated;
grant execute on function public.create_trip(text, date, int, text, int) to authenticated;
grant execute on function public.join_trip_by_invite(text) to authenticated;
