import { NextResponse } from "next/server";
import { requireTripMember } from "@/lib/auth/server";

export async function POST(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase, user } = await requireTripMember(tripId);

  // Check if user is organizer
  const { data: membership } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role === "organizer") {
    return NextResponse.json({ error: "Organizer cannot leave trip" }, { status: 400 });
  }

  const { error } = await supabase
    .from("trip_members")
    .delete()
    .eq("trip_id", tripId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
