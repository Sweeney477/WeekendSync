import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { upsertVoteSchema } from "@/lib/validation/votes";

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = upsertVoteSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { voteType, rankings } = parsed.data;

  const { error } = await supabase.from("votes_ranked").upsert(
    {
      trip_id: tripId,
      user_id: me.user.id,
      vote_type: voteType,
      rankings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trip_id,user_id,vote_type" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 200 });
}

