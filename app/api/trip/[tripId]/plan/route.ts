import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireTripMember } from "@/lib/auth/server";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, invite_code, created_at, created_by, privacy, emergency_contact")
    .eq("id", tripId)
    .single();

  if (error || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

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
    },
  });
}
