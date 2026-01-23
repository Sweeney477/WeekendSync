import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTripMember } from "@/lib/auth/server";

const updateSettingsSchema = z.object({
  privacy: z.enum(["code", "invite"]).optional(),
  emergencyContact: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  // Check if user is organizer
  const { data: membership } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!membership || membership.role !== "organizer") {
    return NextResponse.json({ error: "Only organizer can update settings" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updateData: any = {};
  if (parsed.data.privacy !== undefined) updateData.privacy = parsed.data.privacy;
  if (parsed.data.emergencyContact !== undefined)
    updateData.emergency_contact = parsed.data.emergencyContact || null;

  const { error } = await supabase.from("trips").update(updateData).eq("id", tripId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
