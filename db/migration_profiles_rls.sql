-- Migration: Allow authenticated users to read all profiles
-- This fixes the "Unknown" member name issue where RLS blocked reading other users' profiles

-- Drop all existing profiles SELECT policies to avoid conflicts
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_select_members" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;

-- Create new policy: any authenticated user can read profiles
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);

-- Note: INSERT and UPDATE policies remain unchanged (owner-only)
