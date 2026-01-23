-- Migration: First Date + timeframe-based option generation
--
-- Adds:
-- - trips.first_date (date)
-- - trips.trip_length_days (int)
-- - Normalizes trips.timeframe_mode default + existing values
-- - Updates create_trip() RPC signature to accept first date + trip type

-- 1) Trips columns
alter table public.trips
  add column if not exists first_date date not null default current_date,
  add column if not exists trip_length_days int not null default 3;

-- Normalize timeframe_mode defaults / legacy values
alter table public.trips alter column timeframe_mode set default 'weekend';
update public.trips set timeframe_mode = 'weekend' where timeframe_mode = 'weekends';

-- 2) RPC: create_trip
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

  -- create unique invite code (8 chars hex)
  loop
    v_try := v_try + 1;
    v_code := upper(substring(md5(gen_random_uuid()::text) from 1 for 8));
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

