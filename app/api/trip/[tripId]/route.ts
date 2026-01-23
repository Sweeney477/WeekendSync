import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, status, invite_code, selected_weekend_start, selected_destination_id, created_at")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !trip) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(
    {
      trip: {
        id: trip.id,
        name: trip.name,
        status: trip.status,
        inviteCode: trip.invite_code,
        selectedWeekendStart: trip.selected_weekend_start,
        selectedDestinationId: trip.selected_destination_id,
      },
    },
    { status: 200 },
  );
}

