import { NextResponse } from "next/server";
import { joinTripSchema } from "@/lib/validation/trips";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const limiter = rateLimit(`${me.user.id}:${ip}`, { windowMs: 60_000, max: 5, keyPrefix: "join-trip" });
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limiter.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = joinTripSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const inviteCode = parsed.data.inviteCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{8,12}$/.test(inviteCode)) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  const { data: tripId, error } = await supabase.rpc("join_trip_by_invite", { p_invite_code: inviteCode });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ tripId }, { status: 200 });
}
