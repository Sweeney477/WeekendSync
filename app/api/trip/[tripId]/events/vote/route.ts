import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { voteEventSchema } from "@/lib/validation/events";
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
  const parsed = voteEventSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { eventId } = parsed.data;

  const { error: voteErr } = await supabase.from("event_votes").upsert(
    {
      trip_id: tripId,
      event_id: eventId,
      user_id: me.user.id,
      vote: 1,
    },
    { onConflict: "trip_id,event_id,user_id" },
  );
  if (voteErr) return NextResponse.json({ error: voteErr.message }, { status: 400 });

  const { count, error: countErr } = await supabase
    .from("event_votes")
    .select("event_id", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("event_id", eventId);
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, votes: count ?? 0 }, { status: 200 });
}

