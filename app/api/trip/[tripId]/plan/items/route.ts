import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTripMember } from "@/lib/auth/server";

const createItemSchema = z.object({
  title: z.string().min(1),
  dateTime: z.string().nullable().optional(),
  locationText: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  reminderOffsetMinutes: z.number().int().positive().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: items, error } = await supabase
    .from("trip_plan_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("date_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    items:
      items?.map((item) => ({
        id: item.id,
        title: item.title,
        dateTime: item.date_time,
        locationText: item.location_text,
        notes: item.notes,
        ownerId: item.owner_id,
        reminderOffsetMinutes: item.reminder_offset_minutes,
        createdAt: item.created_at,
      })) || [],
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase, user } = await requireTripMember(tripId);

  const json = await req.json().catch(() => null);
  const parsed = createItemSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, dateTime, locationText, notes, ownerId, reminderOffsetMinutes } = parsed.data;

  const { data: item, error } = await supabase
    .from("trip_plan_items")
    .insert({
      trip_id: tripId,
      title,
      date_time: dateTime ? new Date(dateTime).toISOString() : null,
      location_text: locationText || null,
      notes: notes || null,
      owner_id: ownerId || null,
      reminder_offset_minutes: reminderOffsetMinutes || null,
      created_by: user.id,
    })
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
