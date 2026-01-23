import { NextResponse } from "next/server";
import { joinTripSchema } from "@/lib/validation/trips";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = joinTripSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { inviteCode } = parsed.data;

  const { data: tripId, error } = await supabase.rpc("join_trip_by_invite", { p_invite_code: inviteCode });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ tripId }, { status: 200 });
}

