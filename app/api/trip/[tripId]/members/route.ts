import { NextResponse } from "next/server";
import { requireTripMember } from "@/lib/auth/server";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: members, error } = await supabase
    .from("trip_members")
    .select(`
      user_id,
      role,
      joined_at,
      profiles (
        id,
        display_name
      )
    `)
    .eq("trip_id", tripId)
    .order("joined_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    members:
      members?.map((m: any) => ({
        userId: m.user_id,
        displayName: m.profiles?.display_name || "Unknown",
        role: m.role,
        status: "accepted" as const,
        joinedAt: m.joined_at,
      })) || [],
  });
}
