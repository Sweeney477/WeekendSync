-- Migration: Add trip planning features (plan items, costs, logistics, privacy)
-- Run this migration to add the new tables and columns for the trip planning MVP

-- 1. Add new columns to trips table
alter table public.trips
  add column if not exists privacy text not null default 'code',
  add column if not exists emergency_contact text null;

alter table public.trips
  add constraint trips_privacy_check check (privacy in ('code','invite'));

-- 2. Create trip_plan_items table
create table if not exists public.trip_plan_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  date_time timestamptz null,
  location_text text null,
  notes text null,
  owner_id uuid null references public.profiles(id) on delete set null,
  reminder_offset_minutes int null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists trip_plan_items_trip_idx on public.trip_plan_items(trip_id, date_time asc nulls last);
create index if not exists trip_plan_items_owner_idx on public.trip_plan_items(owner_id);
alter table public.trip_plan_items enable row level security;

-- 3. Create trip_costs table
create table if not exists public.trip_costs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  label text not null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  payer_id uuid not null references public.profiles(id),
  settled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists trip_costs_trip_idx on public.trip_costs(trip_id, created_at desc);
create index if not exists trip_costs_payer_idx on public.trip_costs(payer_id);
alter table public.trip_costs enable row level security;

-- 4. Create trip_cost_splits table
create table if not exists public.trip_cost_splits (
  id uuid primary key default gen_random_uuid(),
  cost_id uuid not null references public.trip_costs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  created_at timestamptz not null default now(),
  unique(cost_id, user_id)
);

create index if not exists trip_cost_splits_cost_idx on public.trip_cost_splits(cost_id);
create index if not exists trip_cost_splits_user_idx on public.trip_cost_splits(user_id);
alter table public.trip_cost_splits enable row level security;

-- 5. Create trip_logistics table
create table if not exists public.trip_logistics (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  type text not null, -- 'lodging' | 'transport'
  name text not null,
  dates text not null, -- e.g., "2025-06-15 to 2025-06-18"
  ref text null, -- reference number, confirmation code, etc.
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint trip_logistics_type_check check (type in ('lodging','transport'))
);

create index if not exists trip_logistics_trip_type_idx on public.trip_logistics(trip_id, type);
alter table public.trip_logistics enable row level security;

-- 6. RLS Policies

-- trip_plan_items policies
create policy "trip_plan_items_select_members" on public.trip_plan_items
  for select using (public.is_trip_member(trip_id));

create policy "trip_plan_items_insert_members" on public.trip_plan_items
  for insert with check (
    public.is_trip_member(trip_id)
    and created_by = auth.uid()
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

create policy "trip_plan_items_update_members" on public.trip_plan_items
  for update using (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  )
  with check (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

create policy "trip_plan_items_delete_members" on public.trip_plan_items
  for delete using (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

-- trip_costs policies
create policy "trip_costs_select_members" on public.trip_costs
  for select using (public.is_trip_member(trip_id));

create policy "trip_costs_insert_members" on public.trip_costs
  for insert with check (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

create policy "trip_costs_update_members" on public.trip_costs
  for update using (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  )
  with check (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

create policy "trip_costs_delete_members" on public.trip_costs
  for delete using (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

-- trip_cost_splits policies
create policy "trip_cost_splits_select_members" on public.trip_cost_splits
  for select using (
    exists (
      select 1 from public.trip_costs tc
      where tc.id = trip_cost_splits.cost_id
      and public.is_trip_member(tc.trip_id)
    )
  );

create policy "trip_cost_splits_insert_members" on public.trip_cost_splits
  for insert with check (
    exists (
      select 1 from public.trip_costs tc
      where tc.id = trip_cost_splits.cost_id
      and public.is_trip_member(tc.trip_id)
      and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')
    )
  );

create policy "trip_cost_splits_update_members" on public.trip_cost_splits
  for update using (
    exists (
      select 1 from public.trip_costs tc
      where tc.id = trip_cost_splits.cost_id
      and public.is_trip_member(tc.trip_id)
      and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')
    )
  )
  with check (
    exists (
      select 1 from public.trip_costs tc
      where tc.id = trip_cost_splits.cost_id
      and public.is_trip_member(tc.trip_id)
      and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')
    )
  );

create policy "trip_cost_splits_delete_members" on public.trip_cost_splits
  for delete using (
    exists (
      select 1 from public.trip_costs tc
      where tc.id = trip_cost_splits.cost_id
      and public.is_trip_member(tc.trip_id)
      and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')
    )
  );

-- trip_logistics policies
create policy "trip_logistics_select_members" on public.trip_logistics
  for select using (public.is_trip_member(trip_id));

create policy "trip_logistics_insert_members" on public.trip_logistics
  for insert with check (
    public.is_trip_member(trip_id)
    and created_by = auth.uid()
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

create policy "trip_logistics_update_members" on public.trip_logistics
  for update using (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  )
  with check (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );

create policy "trip_logistics_delete_members" on public.trip_logistics
  for delete using (
    public.is_trip_member(trip_id)
    and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
  );
