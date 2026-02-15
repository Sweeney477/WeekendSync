import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertTripMember } from "@/lib/skills";
import {
  citySelectionSchema,
  weekendTypeSchema,
  sportsPreferencesSchema,
} from "@/lib/validation/guided";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, status, invite_code, first_date, selected_weekend_start, selected_destination_id, weekend_type, selected_city, selected_city_meta, preferences_json, selected_event_id, selected_itinerary_template_id, created_at")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !trip) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const firstDate =
    trip.first_date != null
      ? (typeof trip.first_date === "string" ? trip.first_date : (trip.first_date as Date).toISOString().slice(0, 10))
      : null;

  return NextResponse.json(
    {
      trip: {
        id: trip.id,
        name: trip.name,
        status: trip.status,
        inviteCode: trip.invite_code,
        firstDate,
        selectedWeekendStart: trip.selected_weekend_start,
        selectedDestinationId: trip.selected_destination_id,
        weekendType: trip.weekend_type ?? null,
        selectedCity: trip.selected_city ?? null,
        selectedCityMeta: trip.selected_city_meta ?? null,
        preferencesJson: trip.preferences_json ?? null,
        selectedEventId: trip.selected_event_id ?? null,
        selectedItineraryTemplateId: trip.selected_itinerary_template_id ?? null,
      },
    },
    { status: 200 },
  );
}

const guidedUpdateSchema = z.object({
  weekendType: weekendTypeSchema.optional(),
  selectedCity: citySelectionSchema.optional(),
  preferencesJson: z
    .object({
      weekendType: weekendTypeSchema,
      sports: sportsPreferencesSchema.optional(),
    })
    .optional(),
  selectedItineraryTemplateId: z.string().trim().max(120).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = guidedUpdateSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.weekendType != null) updates.weekend_type = parsed.data.weekendType;
  if (parsed.data.selectedCity != null) {
    updates.selected_city = parsed.data.selectedCity.city;
    updates.selected_city_meta =
      parsed.data.selectedCity.stateCode || parsed.data.selectedCity.countryCode
        ? {
            stateCode: parsed.data.selectedCity.stateCode,
            countryCode: parsed.data.selectedCity.countryCode,
          }
        : null;
  }
  if (parsed.data.preferencesJson != null)
    updates.preferences_json = parsed.data.preferencesJson;
  if (parsed.data.selectedItineraryTemplateId != null)
    updates.selected_itinerary_template_id = parsed.data.selectedItineraryTemplateId;

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { error } = await supabase.from("trips").update(updates).eq("id", tripId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 200 });
}