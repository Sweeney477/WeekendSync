import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ trips: [] }, { status: 200 });

  // Check if user has a profile first
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", me.user.id)
    .maybeSingle();
  
  if (!profile) {
    // User doesn't have a profile yet, return empty trips
    return NextResponse.json({ trips: [] }, { status: 200 });
  }

  const { data: memberships, error } = await supabase
    .from("trip_members")
    .select("trip_id, role, trips!inner(id, name, invite_code, status, selected_weekend_start, selected_destination_id)")
    .eq("user_id", me.user.id);
  
  if (error) {
    console.error("Error fetching trips:", error);
    // Return empty array instead of error to prevent breaking the UI
    return NextResponse.json({ trips: [] }, { status: 200 });
  }

  const origin = new URL(req.url).origin;
  const trips = (memberships ?? []).map((m: any) => ({
    id: m.trips.id as string,
    name: m.trips.name as string,
    inviteCode: m.trips.invite_code as string,
    inviteLink: `${origin}/join/${m.trips.invite_code}`,
    status: m.trips.status as string,
    role: m.role as string,
  }));

  return NextResponse.json({ trips }, { status: 200 });
}

