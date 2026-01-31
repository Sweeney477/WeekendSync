-- Migration: Invite code hardening (length + validation)
-- Safe to run even if base schema not applied (creates required tables first).

-- Ensure required tables exist so type public.trips and function bodies resolve
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  home_city text null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id),
  timeframe_mode text not null default 'weekend',
  first_date date not null default current_date,
  trip_length_days int not null default 3,
  lookahead_weeks int not null default 12,
  status text not null default 'open',
  selected_destination_id uuid null,
  selected_weekend_start date null,
  invite_code text unique not null,
  privacy text not null default 'code',
  emergency_contact text null,
  created_at timestamptz not null default now(),
  constraint trips_status_check check (status in ('open','locked')),
  constraint trips_privacy_check check (privacy in ('code','invite'))
);
create index if not exists trips_invite_code_idx on public.trips(invite_code);
create index if not exists trips_created_by_idx on public.trips(created_by);
alter table public.trips enable row level security;

create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id),
  constraint trip_members_role_check check (role in ('organizer','member'))
);
create index if not exists trip_members_user_id_idx on public.trip_members(user_id);
alter table public.trip_members enable row level security;

create table if not exists public.weekend_options (
  trip_id uuid not null references public.trips(id) on delete cascade,
  weekend_start date not null,
  weekend_end date not null,
  score int not null default 0,
  primary key (trip_id, weekend_start)
);
create index if not exists weekend_options_trip_score_idx on public.weekend_options(trip_id, score desc, weekend_start asc);
alter table public.weekend_options enable row level security;

-- Update create_trip invite code length (12 chars)
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

-- Normalize and validate invite code on join
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
