import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertTripMember } from "@/lib/skills";

type WeekendRow = {
  trip_id: string;
  weekend_start: string;
  weekend_end: string;
  score: number;
};

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

  const { data: tripMeta, error: tripMetaError } = await supabase
    .from("trips")
    .select("timeframe_mode, trip_length_days")
    .eq("id", tripId)
    .maybeSingle();
  if (tripMetaError || !tripMeta) return NextResponse.json({ error: "Failed to load trip" }, { status: 400 });

  const { data: weekends, error: weekendsError } = await supabase
    .from("weekend_options")
    .select("trip_id, weekend_start, weekend_end, score")
    .eq("trip_id", tripId)
    .order("score", { ascending: false })
    .order("weekend_start", { ascending: true });
  if (weekendsError) return NextResponse.json({ error: weekendsError.message }, { status: 400 });

  const { data: availability, error: availError } = await supabase
    .from("availability")
    .select("weekend_start, status")
    .eq("trip_id", tripId);
  if (availError) return NextResponse.json({ error: availError.message }, { status: 400 });

  const countsByWeekend = new Map<
    string,
    { yes: number; maybe: number; no: number; unset: number; total: number }
  >();

  for (const row of availability ?? []) {
    const k = row.weekend_start as string;
    const c = countsByWeekend.get(k) ?? { yes: 0, maybe: 0, no: 0, unset: 0, total: 0 };
    const s = row.status as "yes" | "maybe" | "no" | "unset";
    c[s] += 1;
    c.total += 1;
    countsByWeekend.set(k, c);
  }

  return NextResponse.json(
    {
      timeframeMode: tripMeta.timeframe_mode,
      tripLengthDays: tripMeta.trip_length_days,
      weekends: (weekends as WeekendRow[]).map((w) => ({
        ...w,
        counts: countsByWeekend.get(w.weekend_start) ?? { yes: 0, maybe: 0, no: 0, unset: 0, total: 0 },
      })),
    },
    { status: 200 },
  );
}

