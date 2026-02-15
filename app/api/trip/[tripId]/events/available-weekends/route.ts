import { NextResponse } from "next/server";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { getEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertTripMember } from "@/lib/skills";
import { getDefaultEventsProvider } from "@/lib/events/providers";

/** Weekend start = Friday (weekStartsOn: 5). Weekend end = Sunday = start + 2 days. */
function getWeekendFromEventDate(isoDate: string): { weekendStart: string; weekendEnd: string } | null {
  try {
    const d = parseISO(isoDate);
    const friday = startOfWeek(d, { weekStartsOn: 5 });
    const sunday = addDays(friday, 2);
    return {
      weekendStart: format(friday, "yyyy-MM-dd"),
      weekendEnd: format(sunday, "yyyy-MM-dd"),
    };
  } catch {
    return null;
  }
}

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
  const city = url.searchParams.get("city")?.trim();
  const sport = url.searchParams.get("sport")?.trim() || "baseball";
  const team = url.searchParams.get("team")?.trim() || undefined;
  const windowMonths = Math.min(6, Math.max(1, parseInt(url.searchParams.get("windowMonths") ?? "3", 10) || 3));
  const windowStartParam = url.searchParams.get("windowStart")?.trim();

  if (!city) return NextResponse.json({ error: "city is required" }, { status: 400 });

  const env = getEnv();
  if (!env.TICKETMASTER_API_KEY)
    return NextResponse.json({ error: "Event search is not configured" }, { status: 502 });

  const yyyyMmDd = /^\d{4}-\d{2}-\d{2}$/;
  let windowStart: string;
  let windowEnd: string;
  if (windowStartParam && yyyyMmDd.test(windowStartParam)) {
    try {
      const startDate = parseISO(windowStartParam);
      windowStart = format(startDate, "yyyy-MM-dd");
      windowEnd = format(addDays(startDate, windowMonths * 31), "yyyy-MM-dd");
    } catch {
      windowStart = format(new Date(), "yyyy-MM-dd");
      windowEnd = format(addDays(new Date(), windowMonths * 31), "yyyy-MM-dd");
    }
  } else {
    windowStart = format(new Date(), "yyyy-MM-dd");
    windowEnd = format(addDays(new Date(), windowMonths * 31), "yyyy-MM-dd");
  }

  const provider = getDefaultEventsProvider();
  let events: Awaited<ReturnType<typeof provider.searchEvents>>;
  try {
    events = await provider.searchEvents({
      city,
      sport,
      team,
      windowStart,
      windowEnd,
      limit: 200,
    });
  } catch (err) {
    console.error("Available weekends search failed:", err);
    return NextResponse.json(
      { error: "Event search failed. Try again later." },
      { status: 502 },
    );
  }

  const byWeekend = new Map<string, { weekendStart: string; weekendEnd: string; gameCount: number }>();
  for (const e of events) {
    if (!e.startTime) continue;
    const w = getWeekendFromEventDate(e.startTime);
    if (!w) continue;
    const key = w.weekendStart;
    const existing = byWeekend.get(key);
    if (existing) {
      existing.gameCount += 1;
    } else {
      byWeekend.set(key, { ...w, gameCount: 1 });
    }
  }

  const weekends = Array.from(byWeekend.values()).sort(
    (a, b) => a.weekendStart.localeCompare(b.weekendStart),
  );

  return NextResponse.json(
    { weekends, meta: { count: weekends.length } },
    { status: 200 },
  );
}
