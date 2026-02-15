-- WeekendSync schema + RLS (Supabase Postgres)
-- REORDERED: Extensions -> Tables -> Functions -> Policies -> Triggers

-- 1. Extensions
create extension if not exists pgcrypto;

-- 2. Tables

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  home_city text null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- trips (basic definition, nullable FKs handled later)
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id),
  -- Controls how date options are generated (e.g. weekend, long_weekend, week, dinner, custom)
  timeframe_mode text not null default 'weekend',
  -- Earliest date we should consider when generating options
  first_date date not null default current_date,
  -- Number of consecutive days each option spans
  trip_length_days int not null default 3,
  lookahead_weeks int not null default 12,
  status text not null default 'open', -- open|locked
  selected_destination_id uuid null, -- Circular Ref: Linked later
  selected_weekend_start date null,
  invite_code text unique not null,
  privacy text not null default 'code', -- code|invite
  emergency_contact text null,
  -- Guided flow (weekend type, sports, baseball)
  weekend_type text null, -- friends|concert|sports|food_bars|chill|other
  selected_city text null,
  selected_city_meta jsonb null,
  preferences_json jsonb null,
  selected_event_id uuid null, -- FK added after events table
  selected_itinerary_template_id text null,
  created_at timestamptz not null default now(),
  constraint trips_status_check check (status in ('open','locked')),
  constraint trips_privacy_check check (privacy in ('code','invite'))
);

create index if not exists trips_invite_code_idx on public.trips(invite_code);
create index if not exists trips_created_by_idx on public.trips(created_by);
alter table public.trips enable row level security;

-- trip_members
create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member', -- organizer|member
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id),
  constraint trip_members_role_check check (role in ('organizer','member'))
);

create index if not exists trip_members_user_id_idx on public.trip_members(user_id);
alter table public.trip_members enable row level security;

-- weekend_options
create table if not exists public.weekend_options (
  trip_id uuid not null references public.trips(id) on delete cascade,
  weekend_start date not null,
  weekend_end date not null,
  score int not null default 0,
  primary key (trip_id, weekend_start)
);

create index if not exists weekend_options_trip_score_idx on public.weekend_options(trip_id, score desc, weekend_start asc);
alter table public.weekend_options enable row level security;

-- availability
create table if not exists public.availability (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  weekend_start date not null,
  status text not null, -- yes|maybe|no|unset
  updated_at timestamptz not null default now(),
  primary key (trip_id, user_id, weekend_start),
  constraint availability_status_check check (status in ('yes','maybe','no','unset'))
);

create index if not exists availability_trip_weekend_idx on public.availability(trip_id, weekend_start);
create index if not exists availability_user_idx on public.availability(user_id);
alter table public.availability enable row level security;

-- destination_options
create table if not exists public.destination_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  city_name text not null,
  country_code text null,
  lat double precision null,
  lng double precision null,
  rationale_tags text[] not null default '{}'::text[],
  rank_score int not null default 0,
  created_by uuid null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists destination_options_trip_rank_idx on public.destination_options(trip_id, rank_score desc, created_at asc);
alter table public.destination_options enable row level security;

-- votes_ranked
create table if not exists public.votes_ranked (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null, -- weekend|destination
  rankings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint votes_ranked_type_check check (vote_type in ('weekend','destination')),
  constraint votes_ranked_unique unique (trip_id, user_id, vote_type)
);

create index if not exists votes_ranked_trip_type_idx on public.votes_ranked(trip_id, vote_type);
alter table public.votes_ranked enable row level security;

-- events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  external_source text not null default 'ticketmaster',
  external_event_id text not null,
  title text not null,
  start_time timestamptz not null,
  venue text null,
  category text null,
  url text null,
  sport text null,
  league text null,
  home_team text null,
  away_team text null,
  city text null,
  image_url text null,
  ticket_availability_status text null, -- available|limited|unknown|unavailable
  raw_payload jsonb null,
  created_at timestamptz not null default now(),
  constraint events_unique unique (trip_id, external_source, external_event_id)
);

create index if not exists events_trip_idx on public.events(trip_id, start_time asc);
alter table public.events enable row level security;

-- event_saves
create table if not exists public.event_saves (
  trip_id uuid not null references public.trips(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trip_id, event_id, user_id)
);

alter table public.event_saves enable row level security;

-- event_votes (simple upvote)
create table if not exists public.event_votes (
  trip_id uuid not null references public.trips(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote int not null default 1,
  created_at timestamptz not null default now(),
  primary key (trip_id, event_id, user_id),
  constraint event_votes_vote_check check (vote in (1))
);

alter table public.event_votes enable row level security;

-- trip_plan_items
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

-- trip_costs
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

-- trip_cost_splits
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

-- trip_logistics
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

-- 3. Functions (that depend on tables)

-- Helper: check membership
-- Must be security definer to bypass RLS when checking membership (avoids circular dependency)
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = p_trip_id
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_trip_organizer(p_trip_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = p_trip_id
      and tm.user_id = auth.uid()
      and tm.role = 'organizer'
  );
$$;

-- Create trip + organizer membership + weekend options
create or replace function public.create_trip(
  p_name text,
  p_first_date date,
  p_lookahead_weeks int default 12,
  p_timeframe_mode text default 'weekend',
  p_trip_length_days int default null
)
returns public.trips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip public.trips;
  v_code text;
  v_try int := 0;
  v_user uuid := auth.uid();
  v_requested_dow int;
  v_delta int;
  v_first_start date;
  v_i int;
  v_span_days int;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  if p_first_date is null then
    raise exception 'first_date_required';
  end if;

  -- create unique invite code (12 chars, uppercase alphanumeric)
  loop
    v_try := v_try + 1;
    v_code := upper(substring(md5(gen_random_uuid()::text) from 1 for 12));
    exit when not exists (select 1 from public.trips t where t.invite_code = v_code);
    if v_try > 25 then
      raise exception 'failed_to_generate_invite_code';
    end if;
  end loop;

  -- Normalize planning window
  p_lookahead_weeks := greatest(1, least(52, coalesce(p_lookahead_weeks, 12)));

  -- Determine option start weekday + span length
  if p_timeframe_mode = 'weekend' then
    v_requested_dow := 5; -- Fri
    v_span_days := 3;
  elsif p_timeframe_mode = 'long_weekend' then
    v_requested_dow := 4; -- Thu
    v_span_days := 5;
  elsif p_timeframe_mode = 'week' then
    v_requested_dow := 1; -- Mon
    v_span_days := 7;
  elsif p_timeframe_mode = 'dinner' then
    v_requested_dow := extract(dow from p_first_date)::int;
    v_span_days := 1;
  elsif p_timeframe_mode = 'custom' then
    v_requested_dow := extract(dow from p_first_date)::int;
    v_span_days := coalesce(p_trip_length_days, 0);
  else
    raise exception 'invalid_timeframe_mode';
  end if;

  if v_span_days < 1 or v_span_days > 30 then
    raise exception 'invalid_trip_length_days';
  end if;

  -- Snap p_first_date to the next requested weekday (inclusive)
  v_delta := (v_requested_dow - extract(dow from p_first_date)::int + 7) % 7;
  v_first_start := p_first_date + v_delta;

  insert into public.trips (name, created_by, timeframe_mode, first_date, trip_length_days, lookahead_weeks, invite_code)
  values (p_name, v_user, p_timeframe_mode, p_first_date, v_span_days, p_lookahead_weeks, v_code)
  returning * into v_trip;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip.id, v_user, 'organizer');

  -- Generate weekly options (each option spans v_trip.trip_length_days days)
  for v_i in 0..(v_trip.lookahead_weeks - 1) loop
    insert into public.weekend_options (trip_id, weekend_start, weekend_end)
    values (
      v_trip.id,
      v_first_start + (v_i * 7),
      (v_first_start + (v_i * 7)) + (v_trip.trip_length_days - 1)
    )
    on conflict do nothing;
  end loop;

  return v_trip;
end;
$$;

grant execute on function public.create_trip(text, date, int, text, int) to authenticated;

-- Join a trip by invite code (creates membership for current user)
create or replace function public.join_trip_by_invite(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_trip_id uuid;
  v_code text;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  v_code := upper(trim(p_invite_code));
  if v_code !~ '^[A-Z0-9]{8,12}$' then
    raise exception 'invalid_invite_code';
  end if;

  select t.id into v_trip_id
  from public.trips t
  where t.invite_code = v_code;

  if v_trip_id is null then
    raise exception 'invalid_invite_code';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, v_user, 'member')
  on conflict do nothing;

  return v_trip_id;
end;
$$;

grant execute on function public.join_trip_by_invite(text) to authenticated;

-- Recompute stored scores on weekend_options based on availability
create or replace function public.recompute_weekend_scores(p_trip_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.weekend_options wo
  set score = coalesce(a.yes_count, 0) * 2 + coalesce(a.maybe_count, 0) * 1
  from (
    select
      trip_id,
      weekend_start,
      sum(case when status = 'yes' then 1 else 0 end) as yes_count,
      sum(case when status = 'maybe' then 1 else 0 end) as maybe_count
    from public.availability
    where trip_id = p_trip_id
    group by trip_id, weekend_start
  ) a
  where wo.trip_id = p_trip_id
    and wo.trip_id = a.trip_id
    and wo.weekend_start = a.weekend_start;
$$;

grant execute on function public.recompute_weekend_scores(uuid) to authenticated;

-- 4. Triggers (updated_at)

-- Timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Availability Trigger
drop trigger if exists availability_set_updated_at on public.availability;
create trigger availability_set_updated_at
before update on public.availability
for each row execute function public.set_updated_at();

-- Votes Ranked Trigger
drop trigger if exists votes_ranked_set_updated_at on public.votes_ranked;
create trigger votes_ranked_set_updated_at
before update on public.votes_ranked
for each row execute function public.set_updated_at();

-- Auth Trigger (New User)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Policies (RLS)

-- profiles linkage
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_select_members" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
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

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- trips policies
drop policy if exists "trips_select_members" on public.trips;
create policy "trips_select_members" on public.trips for select using (public.is_trip_member(id));

drop policy if exists "trips_insert_creator" on public.trips;
create policy "trips_insert_creator" on public.trips for insert with check (created_by = auth.uid());

drop policy if exists "trips_update_organizer" on public.trips;
create policy "trips_update_organizer" on public.trips for update using (public.is_trip_organizer(id)) with check (public.is_trip_organizer(id));

-- trip_members policies
-- Now that is_trip_member is security definer, we can use it safely without circular dependency
drop policy if exists "trip_members_select_members" on public.trip_members;
create policy "trip_members_select_members" on public.trip_members for select using (public.is_trip_member(trip_id));
-- Note: inserts handled by security definer functions

-- weekend_options policies
drop policy if exists "weekend_options_select_members" on public.weekend_options;
create policy "weekend_options_select_members" on public.weekend_options for select using (public.is_trip_member(trip_id));

drop policy if exists "weekend_options_update_organizer" on public.weekend_options;
create policy "weekend_options_update_organizer" on public.weekend_options for update using (public.is_trip_organizer(trip_id)) with check (public.is_trip_organizer(trip_id));

-- availability policies
drop policy if exists "availability_select_members" on public.availability;
create policy "availability_select_members" on public.availability for select using (public.is_trip_member(trip_id));

drop policy if exists "availability_upsert_own_open_trip" on public.availability;
create policy "availability_upsert_own_open_trip" on public.availability for insert
with check (
  user_id = auth.uid()
  and public.is_trip_member(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
);

drop policy if exists "availability_update_own_open_trip" on public.availability;
create policy "availability_update_own_open_trip" on public.availability for update
using (
  user_id = auth.uid()
  and public.is_trip_member(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
)
with check (
  user_id = auth.uid()
  and public.is_trip_member(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
);

-- destination_options policies
drop policy if exists "destination_options_select_members" on public.destination_options;
create policy "destination_options_select_members" on public.destination_options for select using (public.is_trip_member(trip_id));

drop policy if exists "destination_options_insert_members_open_trip" on public.destination_options;
create policy "destination_options_insert_members_open_trip" on public.destination_options for insert
with check (
  public.is_trip_member(trip_id)
  and created_by = auth.uid()
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
);

drop policy if exists "destination_options_update_organizer_open_trip" on public.destination_options;
create policy "destination_options_update_organizer_open_trip" on public.destination_options for update
using (
  public.is_trip_organizer(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
)
with check (
  public.is_trip_organizer(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
);

-- votes_ranked policies
drop policy if exists "votes_ranked_select_members" on public.votes_ranked;
create policy "votes_ranked_select_members" on public.votes_ranked for select using (public.is_trip_member(trip_id));

drop policy if exists "votes_ranked_upsert_own_open_trip" on public.votes_ranked;
create policy "votes_ranked_upsert_own_open_trip" on public.votes_ranked for insert
with check (
  user_id = auth.uid()
  and public.is_trip_member(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
);

drop policy if exists "votes_ranked_update_own_open_trip" on public.votes_ranked;
create policy "votes_ranked_update_own_open_trip" on public.votes_ranked for update
using (
  user_id = auth.uid()
  and public.is_trip_member(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
)
with check (
  user_id = auth.uid()
  and public.is_trip_member(trip_id)
  and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')
);

-- event policies
drop policy if exists "events_select_members" on public.events;
create policy "events_select_members" on public.events for select using (public.is_trip_member(trip_id));

drop policy if exists "events_insert_members_open_trip" on public.events;
create policy "events_insert_members_open_trip" on public.events for insert with check (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

-- event_saves policies
drop policy if exists "event_saves_select_members" on public.event_saves;
create policy "event_saves_select_members" on public.event_saves for select using (public.is_trip_member(trip_id));

drop policy if exists "event_saves_insert_own_open_trip" on public.event_saves;
create policy "event_saves_insert_own_open_trip" on public.event_saves for insert with check (user_id = auth.uid() and public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

-- event_votes policies
drop policy if exists "event_votes_select_members" on public.event_votes;
create policy "event_votes_select_members" on public.event_votes for select using (public.is_trip_member(trip_id));

drop policy if exists "event_votes_upsert_own_open_trip" on public.event_votes;
create policy "event_votes_upsert_own_open_trip" on public.event_votes for insert with check (user_id = auth.uid() and public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "event_votes_update_own_open_trip" on public.event_votes;
create policy "event_votes_update_own_open_trip" on public.event_votes for update using (user_id = auth.uid() and public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')) with check (user_id = auth.uid() and public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

-- trip_plan_items policies
drop policy if exists "trip_plan_items_select_members" on public.trip_plan_items;
create policy "trip_plan_items_select_members" on public.trip_plan_items for select using (public.is_trip_member(trip_id));

drop policy if exists "trip_plan_items_insert_members" on public.trip_plan_items;
create policy "trip_plan_items_insert_members" on public.trip_plan_items for insert with check (public.is_trip_member(trip_id) and created_by = auth.uid() and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "trip_plan_items_update_members" on public.trip_plan_items;
create policy "trip_plan_items_update_members" on public.trip_plan_items for update using (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')) with check (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "trip_plan_items_delete_members" on public.trip_plan_items;
create policy "trip_plan_items_delete_members" on public.trip_plan_items for delete using (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

-- trip_costs policies
drop policy if exists "trip_costs_select_members" on public.trip_costs;
create policy "trip_costs_select_members" on public.trip_costs for select using (public.is_trip_member(trip_id));

drop policy if exists "trip_costs_insert_members" on public.trip_costs;
create policy "trip_costs_insert_members" on public.trip_costs for insert with check (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "trip_costs_update_members" on public.trip_costs;
create policy "trip_costs_update_members" on public.trip_costs for update using (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')) with check (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "trip_costs_delete_members" on public.trip_costs;
create policy "trip_costs_delete_members" on public.trip_costs for delete using (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

-- trip_cost_splits policies
drop policy if exists "trip_cost_splits_select_members" on public.trip_cost_splits;
create policy "trip_cost_splits_select_members" on public.trip_cost_splits for select using (exists (select 1 from public.trip_costs tc where tc.id = trip_cost_splits.cost_id and public.is_trip_member(tc.trip_id)));

drop policy if exists "trip_cost_splits_insert_members" on public.trip_cost_splits;
create policy "trip_cost_splits_insert_members" on public.trip_cost_splits for insert with check (exists (select 1 from public.trip_costs tc where tc.id = trip_cost_splits.cost_id and public.is_trip_member(tc.trip_id) and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')));

drop policy if exists "trip_cost_splits_update_members" on public.trip_cost_splits;
create policy "trip_cost_splits_update_members" on public.trip_cost_splits for update using (exists (select 1 from public.trip_costs tc where tc.id = trip_cost_splits.cost_id and public.is_trip_member(tc.trip_id) and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open'))) with check (exists (select 1 from public.trip_costs tc where tc.id = trip_cost_splits.cost_id and public.is_trip_member(tc.trip_id) and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')));

drop policy if exists "trip_cost_splits_delete_members" on public.trip_cost_splits;
create policy "trip_cost_splits_delete_members" on public.trip_cost_splits for delete using (exists (select 1 from public.trip_costs tc where tc.id = trip_cost_splits.cost_id and public.is_trip_member(tc.trip_id) and exists (select 1 from public.trips t where t.id = tc.trip_id and t.status = 'open')));

-- trip_logistics policies
drop policy if exists "trip_logistics_select_members" on public.trip_logistics;
create policy "trip_logistics_select_members" on public.trip_logistics for select using (public.is_trip_member(trip_id));

drop policy if exists "trip_logistics_insert_members" on public.trip_logistics;
create policy "trip_logistics_insert_members" on public.trip_logistics for insert with check (public.is_trip_member(trip_id) and created_by = auth.uid() and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "trip_logistics_update_members" on public.trip_logistics;
create policy "trip_logistics_update_members" on public.trip_logistics for update using (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open')) with check (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

drop policy if exists "trip_logistics_delete_members" on public.trip_logistics;
create policy "trip_logistics_delete_members" on public.trip_logistics for delete using (public.is_trip_member(trip_id) and exists (select 1 from public.trips t where t.id = trip_id and t.status = 'open'));

-- 6. Circular Foreign Key fixups
-- Link trips.selected_destination_id -> destination_options.id (nullable)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trips_selected_destination_id_fkey') then
    alter table public.trips
      add constraint trips_selected_destination_id_fkey
      foreign key (selected_destination_id)
      references public.destination_options(id)
      on delete set null;
  end if;
end $$;
-- Link trips.selected_event_id -> events.id (nullable)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trips_selected_event_id_fkey') then
    alter table public.trips
      add constraint trips_selected_event_id_fkey
      foreign key (selected_event_id)
      references public.events(id)
      on delete set null;
  end if;
end $$;