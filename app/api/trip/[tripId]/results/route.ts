import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { computeRankedChoiceWinner } from "@/lib/rankedChoice";

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Weekend candidates
  const { data: weekendCandidates, error: wErr } = await supabase
    .from("weekend_options")
    .select("weekend_start, weekend_end")
    .eq("trip_id", tripId)
    .order("weekend_start", { ascending: true });
  if (wErr) return NextResponse.json({ error: wErr.message }, { status: 400 });

  const weekendCandidatesForRc =
    (weekendCandidates ?? []).map((w) => ({
      id: w.weekend_start as string,
      createdAt: `${w.weekend_start}T00:00:00Z`,
    })) ?? [];

  const { data: weekendVotes, error: wvErr } = await supabase
    .from("votes_ranked")
    .select("rankings")
    .eq("trip_id", tripId)
    .eq("vote_type", "weekend");
  if (wvErr) return NextResponse.json({ error: wvErr.message }, { status: 400 });

  const weekendResult = computeRankedChoiceWinner(
    (weekendVotes ?? []).map((v) => ({ rankings: v.rankings as Record<string, string> })),
    weekendCandidatesForRc,
  );

  // Destination candidates
  const { data: destCandidates, error: dErr } = await supabase
    .from("destination_options")
    .select("id, created_at, city_name")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 400 });

  const destCandidatesForRc =
    (destCandidates ?? []).map((d) => ({
      id: d.id as string,
      createdAt: d.created_at as string,
    })) ?? [];

  const { data: destVotes, error: dvErr } = await supabase
    .from("votes_ranked")
    .select("rankings")
    .eq("trip_id", tripId)
    .eq("vote_type", "destination");
  if (dvErr) return NextResponse.json({ error: dvErr.message }, { status: 400 });

  const destinationResult = computeRankedChoiceWinner(
    (destVotes ?? []).map((v) => ({ rankings: v.rankings as Record<string, string> })),
    destCandidatesForRc,
  );

  return NextResponse.json(
    {
      weekend: weekendResult,
      destination: destinationResult,
    },
    { status: 200 },
  );
}

