import { NextResponse } from "next/server";
import { format, parseISO, startOfWeek } from "date-fns";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { selectEventSchema } from "@/lib/validation/events";
import { assertTripMember } from "@/lib/skills";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Not authorized for this trip",
      },
      { status: 403 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = selectEventSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { provider, event } = parsed.data;
  const source = provider === "ticketmaster" ? "ticketmaster" : provider;

  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .upsert(
      {
        trip_id: tripId,
        external_source: source,
        external_event_id: event.externalEventId,
        title: event.title,
        start_time: event.startTime,
        venue: event.venue ?? null,
        url: event.url ?? null,
        sport: event.sport ?? null,
        league: event.league ?? null,
        home_team: event.homeTeam ?? null,
        away_team: event.awayTeam ?? null,
        city: event.city ?? null,
        image_url: event.imageUrl ?? null,
        ticket_availability_status: event.ticketAvailabilityStatus ?? null,
        raw_payload: (() => {
          const raw = (event as unknown as { raw?: unknown }).raw;
          return raw != null ? JSON.parse(JSON.stringify(raw)) : null;
        })(),
      },
      { onConflict: "trip_id,external_source,external_event_id" }
    )
    .select("id")
    .single();

  if (eventErr)
    return NextResponse.json({ error: eventErr.message }, { status: 400 });

  let selectedWeekendStart: string | null = null;
  if (event.startTime) {
    try {
      const d = parseISO(event.startTime);
      const friday = startOfWeek(d, { weekStartsOn: 5 });
      selectedWeekendStart = format(friday, "yyyy-MM-dd");
    } catch {
      // ignore invalid date
    }
  }

  const { error: updateErr } = await supabase
    .from("trips")
    .update({
      selected_event_id: eventRow.id,
      ...(selectedWeekendStart && { selected_weekend_start: selectedWeekendStart }),
    })
    .eq("id", tripId);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 400 });

  return NextResponse.json(
    {
      tripId,
      selectedEventId: eventRow.id,
      selectedAt: new Date().toISOString(),
      next: `/trip/${tripId}/setup/itinerary`,
    },
    { status: 200 }
  );
}
