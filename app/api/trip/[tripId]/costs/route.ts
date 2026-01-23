import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTripMember } from "@/lib/auth/server";

const createCostSchema = z.object({
  label: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  payerId: z.string().uuid(),
  splits: z.array(
    z.object({
      userId: z.string().uuid(),
      amount: z.number().nonnegative(),
    })
  ),
});

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const { data: costs, error } = await supabase
    .from("trip_costs")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const costsWithSplits = await Promise.all(
    (costs || []).map(async (cost) => {
      const { data: splits } = await supabase
        .from("trip_cost_splits")
        .select("*")
        .eq("cost_id", cost.id);

      return {
        id: cost.id,
        label: cost.label,
        amount: cost.amount,
        currency: cost.currency,
        payerId: cost.payer_id,
        splits: (splits || []).map((s) => ({ userId: s.user_id, amount: s.amount })),
        settled: cost.settled,
        createdAt: cost.created_at,
      };
    })
  );

  return NextResponse.json({ costs: costsWithSplits });
}

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId);

  const json = await req.json().catch(() => null);
  const parsed = createCostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { label, amount, currency, payerId, splits } = parsed.data;

  const { data: cost, error: costError } = await supabase
    .from("trip_costs")
    .insert({
      trip_id: tripId,
      label,
      amount,
      currency,
      payer_id: payerId,
      settled: false,
    })
    .select()
    .single();

  if (costError || !cost) {
    return NextResponse.json({ error: costError?.message || "Failed to create cost" }, { status: 400 });
  }

  // Insert splits
  if (splits.length > 0) {
    const { error: splitsError } = await supabase.from("trip_cost_splits").insert(
      splits.map((split) => ({
        cost_id: cost.id,
        user_id: split.userId,
        amount: split.amount,
      }))
    );

    if (splitsError) {
      // Rollback cost creation
      await supabase.from("trip_costs").delete().eq("id", cost.id);
      return NextResponse.json({ error: splitsError.message }, { status: 400 });
    }
  }

  const { data: splitsData } = await supabase
    .from("trip_cost_splits")
    .select("*")
    .eq("cost_id", cost.id);

  return NextResponse.json({
    cost: {
      id: cost.id,
      label: cost.label,
      amount: cost.amount,
      currency: cost.currency,
      payerId: cost.payer_id,
      splits: (splitsData || []).map((s) => ({ userId: s.user_id, amount: s.amount })),
      settled: cost.settled,
      createdAt: cost.created_at,
    },
  });
}
