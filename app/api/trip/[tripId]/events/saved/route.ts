import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertTripMember } from "@/lib/skills";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Not authorized for this trip" },
      { status: 403 },
    );
  }

  const { data: saves, error: savesErr } = await supabase.from("event_saves").select("event_id").eq("trip_id", tripId);
  if (savesErr) return NextResponse.json({ error: savesErr.message }, { status: 400 });

  const eventIds = Array.from(new Set((saves ?? []).map((s) => s.event_id as string)));
  if (eventIds.length === 0) return NextResponse.json({ events: [] }, { status: 200 });

  const [{ data: events, error: eventsErr }, { data: votes, error: votesErr }] = await Promise.all([
    supabase
      .from("events")
      .select("id, external_source, external_event_id, title, start_time, venue, category, url")
      .eq("trip_id", tripId)
      .in("id", eventIds),
    supabase.from("event_votes").select("event_id").eq("trip_id", tripId).in("event_id", eventIds),
  ]);

  if (eventsErr) return NextResponse.json({ error: eventsErr.message }, { status: 400 });
  if (votesErr) return NextResponse.json({ error: votesErr.message }, { status: 400 });

  const voteCounts = new Map<string, number>();
  for (const v of votes ?? []) {
    const k = v.event_id as string;
    voteCounts.set(k, (voteCounts.get(k) ?? 0) + 1);
  }

  const result = (events ?? [])
    .map((e) => ({
      id: e.id as string,
      externalSource: e.external_source as string,
      externalEventId: e.external_event_id as string,
      title: e.title as string,
      startTime: e.start_time as string,
      venue: (e.venue as string | null) ?? null,
      category: (e.category as string | null) ?? null,
      url: (e.url as string | null) ?? null,
      voteCount: voteCounts.get(e.id as string) ?? 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return NextResponse.json({ events: result }, { status: 200 });
}

