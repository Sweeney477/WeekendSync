import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { saveEventSchema } from "@/lib/validation/events";
import { assertTripMember } from "@/lib/skills";

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
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

  const json = await req.json().catch(() => null);
  const parsed = saveEventSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { externalEventId, title, startTime, venue, category, url } = parsed.data;

  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .upsert(
      {
        trip_id: tripId,
        external_source: "ticketmaster",
        external_event_id: externalEventId,
        title,
        start_time: startTime,
        venue: venue ?? null,
        category: category ?? null,
        url: url ?? null,
      },
      { onConflict: "trip_id,external_source,external_event_id" },
    )
    .select("id")
    .single();

  if (eventErr) return NextResponse.json({ error: eventErr.message }, { status: 400 });

  const { error: saveErr } = await supabase.from("event_saves").upsert(
    {
      trip_id: tripId,
      event_id: eventRow.id,
      user_id: me.user.id,
    },
    { onConflict: "trip_id,event_id,user_id" },
  );
  if (saveErr) return NextResponse.json({ error: saveErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, eventId: eventRow.id }, { status: 200 });
}

