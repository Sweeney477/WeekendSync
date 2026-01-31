-- Migration: Safer public_profiles view + scoped profile access
-- This fixes the "Unknown" member name issue without exposing full profile rows to all users.
-- Safe to run even if profiles does not exist yet (creates it first).

-- Ensure profiles table exists (in case this migration runs before full schema)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  home_city text null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Drop all existing profiles SELECT policies to avoid conflicts
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_select_members" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;

-- Create public view with only safe fields
drop view if exists public.public_profiles;
create view public.public_profiles as
select id, display_name
from public.profiles;
grant select on public.public_profiles to authenticated;

-- Allow users to read their own full profile
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- Allow users to read profiles of members that share a trip (only if trip_members exists)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'trip_members'
  ) then
    drop policy if exists "profiles_select_shared_trip" on public.profiles;
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
  end if;
end
$$;

-- Note: INSERT and UPDATE policies remain unchanged (owner-only)
