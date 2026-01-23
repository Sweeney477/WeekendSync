import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const inviteCode = url.searchParams.get("inviteCode");
  const next = url.searchParams.get("next");
  const code = url.searchParams.get("code");

  const supabase = await createServerSupabaseClient();
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Ensure a profile row exists; if display_name missing we’ll push user to onboarding.
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.redirect(new URL("/sign-in", url.origin));

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", me.user.id).maybeSingle();
  if (!profile?.display_name) {
    const dest = new URL("/onboarding", url.origin);
    if (inviteCode) dest.searchParams.set("inviteCode", inviteCode);
    if (next) dest.searchParams.set("next", next);
    return NextResponse.redirect(dest);
  }

  if (inviteCode) {
    try {
      const { data: tripId } = await supabase.rpc("join_trip_by_invite", { p_invite_code: inviteCode });
      if (tripId) return NextResponse.redirect(new URL(`/trip/${tripId}/plan`, url.origin));
    } catch {
      // ignore
    }
  }

  if (next) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  return NextResponse.redirect(new URL("/", url.origin));
}

