import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireTripMember } from "@/lib/auth/server";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, invite_code, created_at, created_by, privacy, emergency_contact, selected_city, weekend_type")
    .eq("id", tripId)
    .single();

  if (error || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Fetch top weekend (simplified version of dashboard logic)
  const { data: topWeekendData } = await supabase
    .from("weekend_options")
    .select("weekend_start, weekend_end, score")
    .eq("trip_id", tripId)
    .order("score", { ascending: false })
    .order("weekend_start", { ascending: true })
    .limit(1)
    .maybeSingle();

  const origin = new URL(_req.url).origin;
  const inviteLink = `${origin}/join/${trip.invite_code}`;

  return NextResponse.json({
    trip: {
      id: trip.id,
      name: trip.name,
      inviteCode: trip.invite_code,
      inviteLink,
      createdAt: trip.created_at,
      organizerId: trip.created_by,
      privacy: (trip.privacy as "code" | "invite") || "code",
      emergencyContact: trip.emergency_contact || undefined,
      selectedCity: trip.selected_city || null,
      weekendType: trip.weekend_type || null,
      topWeekend: topWeekendData || null,
    },
  });
}
