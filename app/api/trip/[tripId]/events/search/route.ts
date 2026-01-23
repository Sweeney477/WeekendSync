import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ticketmasterSearchSchema } from "@/lib/validation/events";
import { assertTripMember } from "@/lib/skills";

type TicketmasterEventDTO = {
  externalEventId: string;
  title: string;
  startTime: string; // ISO
  venue: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
};

export async function GET(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await assertTripMember(supabase, tripId, me.user.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Not authorized for this trip" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const parsed = ticketmasterSearchSchema.safeParse({
    city: url.searchParams.get("city"),
    startDate: url.searchParams.get("startDate"),
    endDate: url.searchParams.get("endDate"),
    category: url.searchParams.get("category") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const env = getEnv();
  if (!env.TICKETMASTER_API_KEY) return NextResponse.json({ error: "Missing TICKETMASTER_API_KEY" }, { status: 500 });

  const { city, startDate, endDate, category } = parsed.data;
  const startDateTime = `${startDate}T00:00:00Z`;
  const endDateTime = `${endDate}T23:59:59Z`;

  const tmUrl = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  tmUrl.searchParams.set("apikey", env.TICKETMASTER_API_KEY);
  tmUrl.searchParams.set("city", city);
  tmUrl.searchParams.set("startDateTime", startDateTime);
  tmUrl.searchParams.set("endDateTime", endDateTime);
  tmUrl.searchParams.set("size", "24");
  tmUrl.searchParams.set("sort", "date,asc");
  if (category) tmUrl.searchParams.set("classificationName", category);

  const resp = await fetch(tmUrl, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!resp.ok) {
    return NextResponse.json({ error: `Ticketmaster error (${resp.status})` }, { status: 502 });
  }

  const json = (await resp.json()) as any;
  const items: any[] = json?._embedded?.events ?? [];

  const events: TicketmasterEventDTO[] = items
    .map((e) => {
      const externalEventId = String(e?.id ?? "");
      const title = String(e?.name ?? "");
      const startTime = String(e?.dates?.start?.dateTime ?? "");
      const venue = e?._embedded?.venues?.[0]?.name ? String(e._embedded.venues[0].name) : null;
      const category = e?.classifications?.[0]?.segment?.name ? String(e.classifications[0].segment.name) : null;
      const url = e?.url ? String(e.url) : null;
      const imageUrl = e?.images?.[0]?.url ? String(e.images[0].url) : null;

      if (!externalEventId || !title || !startTime) return null;
      return { externalEventId, title, startTime, venue, category, url, imageUrl };
    })
    .filter(Boolean) as TicketmasterEventDTO[];

  return NextResponse.json({ events }, { status: 200 });
}

