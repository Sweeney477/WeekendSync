import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ticketmasterSearchSchema, eventsSearchQuerySchema } from "@/lib/validation/events";
import { assertTripMember } from "@/lib/skills";
import { getDefaultEventsProvider, getEventsProvider } from "@/lib/events/providers";

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
  const providerKey = url.searchParams.get("provider") ?? "ticketmaster";

  // New guided-flow contract: city, windowStart, windowEnd (sport, team optional); tripId from path
  const guidedParams = {
    tripId,
    city: url.searchParams.get("city"),
    sport: url.searchParams.get("sport") ?? undefined,
    team: url.searchParams.get("team") ?? undefined,
    windowStart: url.searchParams.get("windowStart"),
    windowEnd: url.searchParams.get("windowEnd"),
    provider: url.searchParams.get("provider") ?? undefined,
  };
  const guidedParsed = eventsSearchQuerySchema.safeParse(guidedParams);

  if (guidedParsed.success) {
    const env = getEnv();
    if (!env.TICKETMASTER_API_KEY)
      return NextResponse.json({ error: "Event search is not configured" }, { status: 502 });

    const provider = getEventsProvider(providerKey) ?? getDefaultEventsProvider();
    const { city, windowStart, windowEnd, sport, team } = guidedParsed.data;
    try {
      const events = await provider.searchEvents({
        city,
        sport,
        team,
        windowStart,
        windowEnd,
        limit: 24,
      });
      return NextResponse.json(
        {
          events,
          meta: { provider: provider.providerKey, count: events.length },
        },
        { status: 200 },
      );
    } catch (err) {
      console.error("Events provider search failed:", err);
      return NextResponse.json(
        { error: "Event search failed. Try again later." },
        { status: 502 },
      );
    }
  }

  // Legacy: startDate, endDate, city or keyword, category
  const legacyParsed = ticketmasterSearchSchema.safeParse({
    city: url.searchParams.get("city"),
    keyword: url.searchParams.get("keyword"),
    startDate: url.searchParams.get("startDate"),
    endDate: url.searchParams.get("endDate"),
    category: url.searchParams.get("category") ?? undefined,
  });
  if (!legacyParsed.success) {
    const message = legacyParsed.error.flatten().formErrors?.[0] ?? "Invalid query";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const env = getEnv();
  if (!env.TICKETMASTER_API_KEY)
    return NextResponse.json({ error: "Missing TICKETMASTER_API_KEY" }, { status: 500 });

  const provider = getDefaultEventsProvider();
  const { city, keyword, startDate, endDate, category } = legacyParsed.data;
  const events = await provider.searchEvents({
    city: city ?? "",
    team: keyword ?? undefined,
    windowStart: startDate,
    windowEnd: endDate,
    limit: 24,
  });
  let result = events;
  if (category && category !== "all") {
    result = events.filter(
      (e) =>
        e.sport?.toLowerCase().includes(category.toLowerCase()) ||
        e.title?.toLowerCase().includes(category.toLowerCase()),
    );
  }
  // Legacy shape for existing events-client: category on each event
  const legacyEvents = result.map((e) => ({
    externalEventId: e.externalEventId,
    title: e.title,
    startTime: e.startTime,
    venue: e.venue ?? null,
    category: e.sport ?? e.league ?? null,
    url: e.url ?? null,
    imageUrl: e.imageUrl ?? null,
  }));
  return NextResponse.json(
    { events: legacyEvents, meta: { provider: provider.providerKey, count: legacyEvents.length } },
    { status: 200 },
  );
}

