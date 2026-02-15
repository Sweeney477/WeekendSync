import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertTripMember } from "@/lib/skills";
import { addDestinationSchema } from "@/lib/validation/destinations";

const CURATED_DESTINATIONS: Array<{ city_name: string; country_code: string | null; rationale_tags: string[]; rank_score: number }> =
  [
    { city_name: "Chicago", country_code: "US", rationale_tags: ["major-airport", "central"], rank_score: 90 },
    { city_name: "Dallas", country_code: "US", rationale_tags: ["major-airport", "central"], rank_score: 85 },
    { city_name: "Denver", country_code: "US", rationale_tags: ["outdoors", "central-ish"], rank_score: 80 },
    { city_name: "Atlanta", country_code: "US", rationale_tags: ["major-airport", "food"], rank_score: 78 },
    { city_name: "Nashville", country_code: "US", rationale_tags: ["music", "weekend-trip"], rank_score: 75 },
  ];

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: existing, error } = await supabase
    .from("destination_options")
    .select("id, trip_id, city_name, country_code, lat, lng, rationale_tags, rank_score, created_by, created_at")
    .eq("trip_id", tripId)
    .order("rank_score", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if ((existing?.length ?? 0) > 0) return NextResponse.json({ destinations: existing }, { status: 200 });

  // Seed curated defaults (MVP) on first view
  const { error: seedErr } = await supabase.from("destination_options").insert(
    CURATED_DESTINATIONS.map((d) => ({
      trip_id: tripId,
      city_name: d.city_name,
      country_code: d.country_code,
      rationale_tags: d.rationale_tags,
      rank_score: d.rank_score,
      created_by: me.user!.id,
    })),
  );
  if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 400 });

  const { data: seeded, error: seededErr } = await supabase
    .from("destination_options")
    .select("id, trip_id, city_name, country_code, lat, lng, rationale_tags, rank_score, created_by, created_at")
    .eq("trip_id", tripId)
    .order("rank_score", { ascending: false })
    .order("created_at", { ascending: true });
  if (seededErr) return NextResponse.json({ error: seededErr.message }, { status: 400 });

  return NextResponse.json({ destinations: seeded ?? [] }, { status: 200 });
}

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = addDestinationSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { cityName, countryCode, lat, lng, rationaleTags } = parsed.data;

  const { data, error } = await supabase
    .from("destination_options")
    .insert({
      trip_id: tripId,
      city_name: cityName,
      country_code: countryCode ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      rationale_tags: rationaleTags ?? [],
      created_by: me.user.id,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, destinationId: data.id }, { status: 200 });
}

