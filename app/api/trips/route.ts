import { NextResponse } from "next/server";
import { createTripSchema } from "@/lib/validation/trips";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createTripSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Must have an onboarded profile because trips.created_by references profiles(id).
  const { data: profile } = await supabase.from("profiles").select("id, display_name").eq("id", me.user.id).maybeSingle();
  if (!profile?.display_name) return NextResponse.json({ error: "Complete onboarding first" }, { status: 409 });

  const { name, firstDate, timeframeMode, tripLengthDays } = parsed.data;
  const planningWindowWeeks = parsed.data.planningWindowWeeks ?? parsed.data.lookaheadWeeks ?? 12;

  const { data: tripData, error } = await supabase.rpc("create_trip", {
    p_name: name,
    p_first_date: firstDate,
    p_lookahead_weeks: planningWindowWeeks,
    p_timeframe_mode: timeframeMode,
    p_trip_length_days: tripLengthDays ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Handle case where rpc might return an array or an object
  const trip = Array.isArray(tripData) ? tripData[0] : tripData;
  
  if (!trip) return NextResponse.json({ error: "Failed to create trip record" }, { status: 500 });

  const origin = new URL(req.url).origin;
  const inviteLink = `${origin}/join/${trip.invite_code}`;

  return NextResponse.json(
    {
      trip: {
        id: trip.id,
        name: trip.name,
        inviteCode: trip.invite_code,
        inviteLink,
      },
    },
    { status: 200 },
  );
}

