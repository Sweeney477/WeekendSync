import { NextResponse } from "next/server";
import { upsertProfileSchema } from "@/lib/validation/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = upsertProfileSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { displayName, homeCity } = parsed.data;

  const { error } = await supabase.from("profiles").upsert({
    id: me.user.id,
    display_name: displayName,
    home_city: homeCity ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 200 });
}

