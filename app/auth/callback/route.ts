import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PENDING_JOIN_COOKIE = "pending_join";

function getPendingJoinFromCookie(req: Request): { inviteCode: string; next: string } | null {
  const cookieHeader = req.headers.get("cookie");
  const match = cookieHeader?.match(new RegExp(`${PENDING_JOIN_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as { inviteCode?: string; next?: string };
    return {
      inviteCode: typeof parsed.inviteCode === "string" ? parsed.inviteCode : "",
      next: typeof parsed.next === "string" ? parsed.next : "",
    };
  } catch {
    return null;
  }
}

function clearPendingJoinCookie(response: NextResponse): void {
  response.headers.append("Set-Cookie", `${PENDING_JOIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  let inviteCode = url.searchParams.get("inviteCode");
  let next = url.searchParams.get("next");
  const code = url.searchParams.get("code");

  // If redirect URL had no query params (e.g. Supabase whitelist strips them), use cookie set at sign-in.
  if ((!inviteCode || !next) && typeof req.headers.get("cookie") === "string") {
    const pending = getPendingJoinFromCookie(req);
    if (pending) {
      if (!inviteCode && pending.inviteCode) inviteCode = pending.inviteCode;
      if (!next && pending.next) next = pending.next;
    }
  }

  const supabase = await createServerSupabaseClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Error exchanging code for session:", error.message);
      const errRes = NextResponse.redirect(new URL(`/sign-in?message=${encodeURIComponent(error.message)}`, url.origin));
      clearPendingJoinCookie(errRes);
      return errRes;
    }
  }

  // Ensure a profile row exists; if display_name missing we’ll push user to onboarding.
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) {
    const signInRes = NextResponse.redirect(new URL("/sign-in", url.origin));
    clearPendingJoinCookie(signInRes);
    return signInRes;
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", me.user.id).maybeSingle();

  // When returning from sign-in with an invite: skip onboarding if profile has display_name, else send to onboarding.
  if (inviteCode) {
    if (profile?.display_name && profile.display_name.trim().length > 1) {
      const res = NextResponse.redirect(new URL(`/join/${inviteCode}`, url.origin));
      clearPendingJoinCookie(res);
      return res;
    }
    const dest = new URL("/onboarding", url.origin);
    dest.searchParams.set("inviteCode", inviteCode);
    if (next) dest.searchParams.set("next", next);
    const res = NextResponse.redirect(dest);
    clearPendingJoinCookie(res);
    return res;
  }

  // No invite: if profile missing display_name, push to onboarding.
  if (!profile?.display_name) {
    const dest = new URL("/onboarding", url.origin);
    if (next) dest.searchParams.set("next", next);
    const res = NextResponse.redirect(dest);
    clearPendingJoinCookie(res);
    return res;
  }

  const res = next ? NextResponse.redirect(new URL(next, url.origin)) : NextResponse.redirect(new URL("/", url.origin));
  clearPendingJoinCookie(res);
  return res;
}

