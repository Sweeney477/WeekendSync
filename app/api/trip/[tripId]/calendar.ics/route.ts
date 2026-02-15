import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { buildIcsCalendar, type IcsEvent } from "@/lib/ics";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertTripMember } from "@/lib/skills";

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

  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("id, name, selected_weekend_start, status, selected_destination_id")
    .eq("id", tripId)
    .maybeSingle();
  if (tripErr || !trip) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const weekendStart = trip.selected_weekend_start as string | null;
  if (!weekendStart) return NextResponse.json({ error: "Trip weekend not selected yet" }, { status: 409 });

  const startDate = new Date(`${weekendStart}T00:00:00Z`);
  const endExclusive = addDays(startDate, 3); // Fri->Mon (exclusive)
  const endExclusiveDate = endExclusive.toISOString().slice(0, 10);

  // Top 3 saved events by vote count
  const { data: saves } = await supabase.from("event_saves").select("event_id").eq("trip_id", tripId);
  const eventIds = Array.from(new Set((saves ?? []).map((s) => s.event_id as string)));

  let topEvents: Array<{ id: string; title: string; start_time: string; venue: string | null; url: string | null }> = [];
  if (eventIds.length > 0) {
    const { data: events } = await supabase
      .from("events")
      .select("id, title, start_time, venue, url")
      .eq("trip_id", tripId)
      .in("id", eventIds);

    const { data: votes } = await supabase.from("event_votes").select("event_id").eq("trip_id", tripId).in("event_id", eventIds);

    const voteCounts = new Map<string, number>();
    for (const v of votes ?? []) {
      const k = v.event_id as string;
      voteCounts.set(k, (voteCounts.get(k) ?? 0) + 1);
    }

    topEvents = (events ?? [])
      .slice()
      .sort((a, b) => (voteCounts.get(b.id as string) ?? 0) - (voteCounts.get(a.id as string) ?? 0))
      .slice(0, 3)
      .map((e) => ({
        id: e.id as string,
        title: e.title as string,
        start_time: e.start_time as string,
        venue: (e.venue as string | null) ?? null,
        url: (e.url as string | null) ?? null,
      }));
  }

  const events: IcsEvent[] = [
    {
      uid: `weekendsync-${tripId}-trip`,
      summary: `WeekendSync Trip: ${trip.name}`,
      description: `Status: ${trip.status}`,
      allDay: true,
      startDate: weekendStart,
      endDateExclusive: endExclusiveDate,
    },
    ...topEvents.map((e) => ({
      uid: `weekendsync-${tripId}-event-${e.id}`,
      summary: e.title,
      allDay: false as const,
      startTimeUtc: new Date(e.start_time).toISOString(),
      location: e.venue,
      url: e.url,
    })),
  ];

  const ics = buildIcsCalendar({ calName: "WeekendSync", events });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"weekendsync-${tripId}.ics\"`,
      "Cache-Control": "no-store",
    },
  });
}

