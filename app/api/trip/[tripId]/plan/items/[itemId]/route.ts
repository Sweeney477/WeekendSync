import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTripMember } from "@/lib/auth/server";

const updateItemSchema = z.object({
  title: z.string().min(1).optional(),
  dateTime: z.string().nullable().optional(),
  locationText: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  reminderOffsetMinutes: z.number().int().positive().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const json = await req.json().catch(() => null);
  const parsed = updateItemSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updateData: any = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.dateTime !== undefined)
    updateData.date_time = parsed.data.dateTime ? new Date(parsed.data.dateTime).toISOString() : null;
  if (parsed.data.locationText !== undefined) updateData.location_text = parsed.data.locationText || null;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes || null;
  if (parsed.data.ownerId !== undefined) updateData.owner_id = parsed.data.ownerId || null;
  if (parsed.data.reminderOffsetMinutes !== undefined)
    updateData.reminder_offset_minutes = parsed.data.reminderOffsetMinutes || null;

  const { data: item, error } = await supabase
    .from("trip_plan_items")
    .update(updateData)
    .eq("id", itemId)
    .eq("trip_id", tripId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: {
      id: item.id,
      title: item.title,
      dateTime: item.date_time,
      locationText: item.location_text,
      notes: item.notes,
      ownerId: item.owner_id,
      reminderOffsetMinutes: item.reminder_offset_minutes,
      createdAt: item.created_at,
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { error } = await supabase
    .from("trip_plan_items")
    .delete()
    .eq("id", itemId)
    .eq("trip_id", tripId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
