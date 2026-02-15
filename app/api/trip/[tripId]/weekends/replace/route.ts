import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const replaceWeekendsSchema = z.object({
  weekends: z.array(
    z.object({
      weekendStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      weekendEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  ).min(1).max(100),
});

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", me.user.id)
    .maybeSingle();
  if (!member || member.role !== "organizer")
    return NextResponse.json({ error: "Only the trip organizer can replace weekend options" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = replaceWeekendsSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { weekends } = parsed.data;

  const { error } = await supabase.rpc("replace_weekend_options_for_sports", {
    p_trip_id: tripId,
    p_weekends: weekends,
  });

  if (error) {
    if (error.message === "trip_not_sports")
      return NextResponse.json({ error: "This trip is not set up as a sports trip" }, { status: 400 });
    if (error.message === "weekends_required")
      return NextResponse.json({ error: "At least one weekend is required" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: weekends.length }, { status: 200 });
}
