-- Guided Sports / Baseball Weekend flow
-- Adds trip columns for weekend type, city, preferences, selected event/template.
-- Adds event columns for sport, teams, city, image, availability, raw payload.
-- Run once (Supabase Dashboard → SQL Editor or supabase db push).

-- 1) Trips: guided flow and selection
alter table public.trips
  add column if not exists weekend_type text null,
  add column if not exists selected_city text null,
  add column if not exists selected_city_meta jsonb null,
  add column if not exists preferences_json jsonb null,
  add column if not exists selected_event_id uuid null,
  add column if not exists selected_itinerary_template_id text null;

comment on column public.trips.weekend_type is 'friends|concert|sports|food_bars|chill|other';
comment on column public.trips.selected_city is 'Canonical city for guided flow';
comment on column public.trips.preferences_json is 'Application preferences e.g. sports dateWindow, teamQuery';
comment on column public.trips.selected_event_id is 'FK to events.id for chosen game';
comment on column public.trips.selected_itinerary_template_id is 'Chosen template key';

-- FK: selected_event_id -> events(id). Add constraint only if not present.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'trips_selected_event_id_fkey'
  ) then
    alter table public.trips
      add constraint trips_selected_event_id_fkey
      foreign key (selected_event_id)
      references public.events(id)
      on delete set null;
  end if;
end $$;

-- 2) Events: richer metadata for sports
alter table public.events
  add column if not exists sport text null,
  add column if not exists league text null,
  add column if not exists home_team text null,
  add column if not exists away_team text null,
  add column if not exists city text null,
  add column if not exists image_url text null,
  add column if not exists ticket_availability_status text null,
  add column if not exists raw_payload jsonb null;

comment on column public.events.ticket_availability_status is 'available|limited|unknown|unavailable';
