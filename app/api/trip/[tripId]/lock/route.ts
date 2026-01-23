import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const lockTripSchema = z.object({
  selectedWeekendStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  selectedDestinationId: z.string().uuid(),
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
  if (!member || member.role !== "organizer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = lockTripSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { selectedWeekendStart, selectedDestinationId } = parsed.data;

  const { error } = await supabase
    .from("trips")
    .update({
      selected_weekend_start: selectedWeekendStart,
      selected_destination_id: selectedDestinationId,
      status: "locked",
    })
    .eq("id", tripId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 200 });
}

