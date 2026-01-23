import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { upsertAvailabilitySchema } from "@/lib/validation/availability";
import { assertTripMember } from "@/lib/skills";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("availability")
    .select("weekend_start, status")
    .eq("trip_id", tripId)
    .eq("user_id", me.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(
    {
      availability: (data ?? []).map((r) => ({
        weekendStart: r.weekend_start as string,
        status: r.status as string,
      })),
    },
    { status: 200 },
  );
}

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
  const parsed = upsertAvailabilitySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { weekendStart, status } = parsed.data;

  const { error: upsertError } = await supabase.from("availability").upsert(
    {
      trip_id: tripId,
      user_id: me.user.id,
      weekend_start: weekendStart,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trip_id,user_id,weekend_start" },
  );
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 400 });

  // Update stored overlap scores
  await supabase.rpc("recompute_weekend_scores", { p_trip_id: tripId });

  return NextResponse.json({ ok: true }, { status: 200 });
}

