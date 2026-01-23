import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTripMember } from "@/lib/auth/server";

const createLogisticsSchema = z.object({
  type: z.enum(["lodging", "transport"]),
  name: z.string().min(1),
  dates: z.string().min(1),
  ref: z.string().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: lodging, error: lodgingError } = await supabase
    .from("trip_logistics")
    .select("*")
    .eq("trip_id", tripId)
    .eq("type", "lodging")
    .order("dates", { ascending: true });

  const { data: transport, error: transportError } = await supabase
    .from("trip_logistics")
    .select("*")
    .eq("trip_id", tripId)
    .eq("type", "transport")
    .order("dates", { ascending: true });

  if (lodgingError || transportError) {
    return NextResponse.json(
      { error: lodgingError?.message || transportError?.message || "Failed to fetch logistics" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    logistics: {
      lodging:
        lodging?.map((item) => ({
          id: item.id,
          name: item.name,
          dates: item.dates,
          ref: item.ref || null,
        })) || [],
      transport:
        transport?.map((item) => ({
          id: item.id,
          name: item.name,
          dates: item.dates,
          ref: item.ref || null,
        })) || [],
    },
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase, user } = await requireTripMember(tripId);

  const json = await req.json().catch(() => null);
  const parsed = createLogisticsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { type, name, dates, ref } = parsed.data;

  const { data: item, error } = await supabase
    .from("trip_logistics")
    .insert({
      trip_id: tripId,
      type,
      name,
      dates,
      ref: ref || null,
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
      name: item.name,
      dates: item.dates,
      ref: item.ref || null,
    },
  });
}
