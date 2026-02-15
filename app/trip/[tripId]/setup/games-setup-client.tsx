"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { addDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getWeekendFromEventDate } from "@/lib/events/weekend-from-event";
import type { NormalizedEvent } from "@/lib/events/types";

export function GamesSetupClient({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<{
    selectedCity?: string | null;
    selectedWeekendStart?: string | null;
    preferencesJson?: { sports?: { dateWindowStart?: string; dateWindowEnd?: string; teamQuery?: string } } | null;
  } | null>(null);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const tripRes = await fetch(`/api/trip/${tripId}`, { cache: "no-store" });
      const tripData = await tripRes.json().catch(() => ({}));
      if (!tripRes.ok || !tripData.trip) {
        setLoading(false);
        setError("Could not load trip.");
        return;
      }
      setTrip(tripData.trip);
      const city = tripData.trip.selectedCity ?? "Chicago";
      const sports = tripData.trip.preferencesJson?.sports;
      const selectedWeekendStart = tripData.trip.selectedWeekendStart ?? null;
      let windowStart: string;
      let windowEnd: string;
      if (selectedWeekendStart) {
        windowStart = selectedWeekendStart;
        windowEnd = format(addDays(parseISO(selectedWeekendStart), 2), "yyyy-MM-dd");
      } else {
        windowStart = sports?.dateWindowStart ?? new Date().toISOString().slice(0, 10);
        windowEnd = sports?.dateWindowEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }
      const team = sports?.teamQuery;
      const url = new URL(`/api/trip/${tripId}/events/search`, window.location.origin);
      url.searchParams.set("city", city);
      url.searchParams.set("windowStart", windowStart);
      url.searchParams.set("windowEnd", windowEnd);
      url.searchParams.set("sport", "baseball");
      if (team) url.searchParams.set("team", team);
      const searchRes = await fetch(url.pathname + url.search);
      const searchData = await searchRes.json().catch(() => ({}));
      setLoading(false);
      if (searchRes.ok && Array.isArray(searchData.events)) {
        setEvents(searchData.events);
        if (searchData.events.length === 0) setError("No games found. Try a wider date range or different city.");
      } else {
        setError(searchData.error ?? "Could not load games.");
      }
    })();
  }, [tripId]);

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError(null);
  }

  async function handleUseSelectedDates() {
    if (selectedIds.size === 0) return;
    setError(null);
    setReplaceLoading(true);
    try {
      const selectedEvents = events.filter((e) => selectedIds.has(e.externalEventId));
      const byWeekend = new Map<string, { weekendStart: string; weekendEnd: string }>();
      for (const e of selectedEvents) {
        if (!e.startTime) continue;
        const w = getWeekendFromEventDate(e.startTime);
        if (!w) continue;
        byWeekend.set(w.weekendStart, w);
      }
      const weekends = Array.from(byWeekend.values()).sort((a, b) =>
        a.weekendStart.localeCompare(b.weekendStart)
      );
      if (weekends.length === 0) {
        setError("Could not derive weekends from selected games.");
        setReplaceLoading(false);
        return;
      }
      const replaceRes = await fetch(`/api/trip/${tripId}/weekends/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekends }),
      });
      const replaceData = await replaceRes.json().catch(() => ({}));
      if (!replaceRes.ok) {
        setError(replaceData.error ?? "Could not save weekend options.");
        setReplaceLoading(false);
        return;
      }
      await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferencesJson: {
            weekendType: "sports",
            sports: {
              sport: "baseball",
              teamQuery: trip?.preferencesJson?.sports?.teamQuery ?? undefined,
              dateWindowStart: weekends[0]?.weekendStart,
              dateWindowEnd: weekends[weekends.length - 1]?.weekendEnd,
            },
          },
        }),
      });
      router.push(`/trip/${tripId}/dashboard`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setReplaceLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-8">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-ink-dark">
          Game options
        </h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded border-2 border-black bg-slate-100 dark:border-ink-dark/40 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-24">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-ink-dark">
          Game options
        </h1>
        <p className="mt-1 font-sans text-sm text-slate-600 dark:text-muted-dark">
          Home games in {trip?.selectedCity ?? "your city"}. Select the games you want your group to vote on.
        </p>
      </div>

      {error && events.length === 0 && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-900/20">
          <p className="font-medium text-rose-700 dark:text-rose-300" role="alert">{error}</p>
          <Link href={`/trip/${tripId}/setup/sports-details`} className="mt-3 inline-block font-display text-sm font-bold uppercase tracking-wider text-rose-800 dark:text-rose-200">
            Change dates or city →
          </Link>
        </Card>
      )}

      {error && events.length > 0 && (
        <p className="border-2 border-amber-200 bg-amber-50 p-3 font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {events.map((e) => {
          const date = e.startTime ? parseISO(e.startTime) : null;
          const isSelected = selectedIds.has(e.externalEventId);
          return (
            <Card
              key={e.externalEventId}
              className={`flex flex-col gap-4 transition-colors ${isSelected ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark" : ""}`}
            >
              <button
                type="button"
                onClick={() => toggleSelection(e.externalEventId)}
                className="group flex flex-col gap-4 text-left"
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Deselect" : "Select"} ${e.title}`}
              >
                <div className="relative aspect-video w-full overflow-hidden border-2 border-black bg-slate-100 dark:border-ink-dark/40">
                  <Image
                    src={e.imageUrl ?? "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center border-2 border-black bg-white font-display text-sm font-bold text-black transition-colors group-hover:bg-poster-yellow dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:text-ink-dark">
                    {isSelected ? "✓" : ""}
                  </div>
                  <div className="absolute top-2 right-2 border-2 border-black bg-poster-yellow px-2 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-black">
                    {e.ticketAvailabilityStatus ?? "Unknown"}
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-black dark:text-ink-dark">
                    {e.title}
                  </h2>
                  <p className="mt-1 font-sans text-sm text-slate-600 dark:text-muted-dark">
                    {e.venue ?? "Venue TBA"} {e.city ? ` · ${e.city}` : ""}
                  </p>
                  {date && (
                    <p className="mt-1 font-sans text-sm font-medium text-black dark:text-ink-dark">
                      {format(date, "EEE, MMM d · h:mm a")}
                    </p>
                  )}
                </div>
              </button>
              {e.url && (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center border-2 border-black bg-white font-display text-sm font-bold uppercase tracking-widest text-black hover:bg-slate-50 dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:text-ink-dark dark:hover:bg-surface-dark"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  View tickets
                </a>
              )}
            </Card>
          );
        })}
      </div>

      {selectedIds.size > 0 && (
        <div className="sticky bottom-0 left-0 right-0 z-10 -mx-4 flex flex-col gap-2 border-t-2 border-black bg-white p-4 dark:border-ink-dark/40 dark:bg-surface-dark">
          <p className="font-sans text-sm font-medium text-slate-600 dark:text-muted-dark">
            {selectedIds.size} {selectedIds.size === 1 ? "game" : "games"} selected
          </p>
          <Button
            type="button"
            onClick={handleUseSelectedDates}
            disabled={replaceLoading}
            isLoading={replaceLoading}
            className="w-full"
          >
            Use these dates & continue
          </Button>
        </div>
      )}

      <p className="text-center font-sans text-xs text-slate-500 dark:text-muted-dark">
        <Link href={`/trip/${tripId}/setup/sports-details`} className="underline hover:no-underline">
          Change dates or city
        </Link>
        {" · "}
        <Link href={`/trip/${tripId}/dashboard`} className="underline hover:no-underline">
          Skip to dashboard
        </Link>
      </p>
    </div>
  );
}
