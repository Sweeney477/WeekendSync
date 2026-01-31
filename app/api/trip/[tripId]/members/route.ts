import { NextResponse } from "next/server";
import { requireTripMember } from "@/lib/auth/server";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: members, error } = await supabase
    .from("trip_members")
    .select("user_id, role, joined_at")
    .eq("trip_id", tripId)
    .order("joined_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const profileIds = (members ?? []).map((m) => m.user_id).filter(Boolean);
  if (profileIds.length === 0) {
    return NextResponse.json({ members: [] });
  }
  const { data: profiles, error: profileError } = await supabase
    .from("public_profiles")
    .select("id, display_name")
    .in("id", profileIds);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const profileMap = new Map<string, string>();
  for (const profile of profiles ?? []) {
    profileMap.set(profile.id as string, (profile.display_name as string) || "Unknown");
  }

  return NextResponse.json({
    members:
      members?.map((m: any) => ({
        userId: m.user_id,
        displayName: profileMap.get(m.user_id as string) || "Unknown",
        role: m.role,
        status: "accepted" as const,
        joinedAt: m.joined_at,
      })) || [],
  });
}
