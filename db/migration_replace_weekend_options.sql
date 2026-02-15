-- Replace weekend_options for sports trips (group-pick game weekends flow).
-- Run once (Supabase Dashboard → SQL Editor or supabase db push).

-- p_weekends: jsonb array of { "weekendStart": "YYYY-MM-DD", "weekendEnd": "YYYY-MM-DD" }
create or replace function public.replace_weekend_options_for_sports(
  p_trip_id uuid,
  p_weekends jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_elem jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_trip_organizer(p_trip_id) then
    raise exception 'forbidden_not_organizer';
  end if;

  if not exists (
    select 1 from public.trips t
    where t.id = p_trip_id
      and (t.weekend_type = 'sports' or (t.preferences_json->'sports') is not null)
  ) then
    raise exception 'trip_not_sports';
  end if;

  if jsonb_typeof(p_weekends) != 'array' or jsonb_array_length(p_weekends) = 0 then
    raise exception 'weekends_required';
  end if;

  delete from public.weekend_options where trip_id = p_trip_id;

  for v_elem in select * from jsonb_array_elements(p_weekends)
  loop
    insert into public.weekend_options (trip_id, weekend_start, weekend_end)
    values (
      p_trip_id,
      (v_elem->>'weekendStart')::date,
      (v_elem->>'weekendEnd')::date
    )
    on conflict (trip_id, weekend_start) do nothing;
  end loop;
end;
$$;

grant execute on function public.replace_weekend_options_for_sports(uuid, jsonb) to authenticated;

comment on function public.replace_weekend_options_for_sports(uuid, jsonb) is 'Replace weekend_options with game-weekends for sports trip; organizer only; trip must be sports type.';
