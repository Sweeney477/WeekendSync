import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return NextResponse.json({ user: null, profile: null }, { status: 200 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, home_city, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ user: { id: user.id, email: user.email }, profile }, { status: 200 });
}

