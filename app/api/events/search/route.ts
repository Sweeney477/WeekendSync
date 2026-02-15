import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ticketmasterSearchSchema } from "@/lib/validation/events";
import { searchEvents } from "@/lib/ticketmaster";

type TicketmasterEventDTO = {
  externalEventId: string;
  title: string;
  startTime: string;
  venue: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
};

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = ticketmasterSearchSchema.safeParse({
    city: url.searchParams.get("city"),
    keyword: url.searchParams.get("keyword"),
    startDate: url.searchParams.get("startDate"),
    endDate: url.searchParams.get("endDate"),
    category: url.searchParams.get("category") ?? undefined,
  });
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors?.[0] ?? "Invalid query";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const env = getEnv();
  if (!env.TICKETMASTER_API_KEY) return NextResponse.json({ error: "Event search is not configured" }, { status: 500 });

  const { city, keyword, startDate, endDate, category } = parsed.data;

  const eventsResult = await searchEvents({
    city: city || undefined,
    keyword: keyword || undefined,
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`,
    category: category || undefined,
    size: 24,
  });

  const events: TicketmasterEventDTO[] = eventsResult
    .map((e) => {
      const externalEventId = String(e.id);
      const title = String(e.name);
      const startTime = String(
        e.dates?.start?.dateTime ??
          (e.dates?.start?.localDate
            ? `${e.dates.start.localDate}T12:00:00Z`
            : "")
      );
      const venueName = e._embedded?.venues?.[0]?.name;
      const venue = venueName ? String(venueName) : null;
      const catName = e.classifications?.[0]?.segment?.name;
      const eventCategory = catName ? String(catName) : null;
      const eventUrl = e.url ? String(e.url) : null;
      const imageUrl = e.images?.[0]?.url ? String(e.images[0].url) : null;
      if (!externalEventId || !title || !startTime) return null;
      return {
        externalEventId,
        title,
        startTime,
        venue,
        category: eventCategory,
        url: eventUrl,
        imageUrl,
      };
    })
    .filter((e): e is TicketmasterEventDTO => e !== null);

  return NextResponse.json({ events }, { status: 200 });
}
