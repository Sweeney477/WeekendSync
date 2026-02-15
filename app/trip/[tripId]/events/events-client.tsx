"use client";

import { addDays, format, parseISO } from "date-fns";
import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { Input } from "@/components/ui/Input";

type SearchEvent = {
  externalEventId: string;
  title: string;
  startTime: string;
  venue: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
  priceMin?: number;
};

type SavedEvent = {
  id: string;
  externalSource: string;
  externalEventId: string;
  title: string;
  startTime: string;
  venue: string | null;
  category: string | null;
  url: string | null;
  voteCount: number;
  imageUrl?: string;
};

export function EventsClient({ tripId }: { tripId: string }) {
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");

  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedMap, setSavedMap] = useState<Record<string, string>>({}); // externalEventId -> db eventId

  const refreshSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch(`/api/trip/${tripId}/events/saved`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        const rows = (json?.events ?? []) as SavedEvent[];
        setSavedEvents(rows);
        const map: Record<string, string> = {};
        for (const e of rows) {
          if (e.externalSource === "ticketmaster") map[e.externalEventId] = e.id;
        }
        setSavedMap(map);
      }
    } finally {
      setLoadingSaved(false);
    }
  }, [tripId]);

  useEffect(() => {
    (async () => {
      const [tripRes, destRes] = await Promise.all([
        // [x] Fix ESLint errors in `app/trip/[tripId]/plan/plan-client.tsx` <!-- id: 4 -->
        // [ ] Fix ESLint warnings and dependencies in `app/trip/[tripId]/events/events-client.tsx` <!-- id: 5 -->
        fetch(`/api/trip/${tripId}`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}/destinations`, { cache: "no-store" }),
      ]);
      const tripJson = await tripRes.json();
      const destJson = await destRes.json();

      const selDestId = tripJson.trip.selectedDestinationId;
      const selCity = (destJson.destinations as any[]).find(d => d.id === selDestId)?.city_name || "Denver";
      const selStart = tripJson.trip.selectedWeekendStart || "2024-10-18";

      setCity(selCity);
      setStartDate(selStart);
      const end = addDays(parseISO(selStart), 2).toISOString().slice(0, 10);
      setEndDate(end);

      // Perform initial search
      setLoading(true);
      const url = new URL(`/api/trip/${tripId}/events/search`, window.location.origin);
      url.searchParams.set("city", selCity);
      url.searchParams.set("startDate", selStart);
      url.searchParams.set("endDate", end);
      const searchRes = await fetch(url.pathname + url.search);
      const searchJson = await searchRes.json();
      if (searchRes.ok) setEvents(searchJson.events);
      setLoading(false);
    })();
    refreshSaved();
  }, [tripId, refreshSaved]);

  const handleManualSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`/api/trip/${tripId}/events/search`, window.location.origin);
      if (city) url.searchParams.set("city", city);
      if (keyword) url.searchParams.set("keyword", keyword);
      if (startDate) url.searchParams.set("startDate", startDate);
      if (endDate) url.searchParams.set("endDate", endDate);
      if (category && category !== "all") url.searchParams.set("category", category);

      const searchRes = await fetch(url.pathname + url.search);
      const searchJson = await searchRes.json().catch(() => ({}));
      if (searchRes.ok) {
        setEvents(searchJson.events ?? []);
      } else {
        setError(searchJson.error ?? "Search failed");
      }
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

async function onToggleSave(e: SearchEvent) {
  const dbId = savedMap[e.externalEventId];
  if (dbId) return; // Already saved

  try {
    const res = await fetch(`/api/trip/${tripId}/events/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        externalEventId: e.externalEventId,
        title: e.title,
        startTime: e.startTime,
        venue: e.venue,
        category: e.category,
        url: e.url,
      }),
    });
    if (res.ok) {
      await refreshSaved();
    }
  } catch (err) {
    console.error(err);
  }
}

async function onUpvote(dbEventId: string) {
  try {
    const res = await fetch(`/api/trip/${tripId}/events/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: dbEventId }),
    });
    if (res.ok) await refreshSaved();
  } catch (err) {
    console.error(err);
  }
}

const filteredEvents = useMemo(() => {
  if (category === "all") return events;
  return events.filter(e => e.category?.toLowerCase().includes(category.toLowerCase()));
}, [events, category]);

return (
  <div className="flex flex-col gap-6 pt-4 bg-background-light dark:bg-background-dark min-h-screen">
    <div className="flex flex-col gap-8 px-4 pb-64">
      {/* Search Form */}
      <form onSubmit={handleManualSearch} className="flex flex-col gap-4 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-black dark:text-white">Find Events</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="City"
            placeholder="e.g. Chicago"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="Keyword"
            placeholder="e.g. Concert, Team"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center border-2 border-black bg-brand-500 font-display text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-600 disabled:opacity-50 dark:border-white"
        >
          {loading ? "Searching..." : "Search Events"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-700 text-sm dark:bg-red-950 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setCategory("all")}
          className={`flex h-10 items-center justify-center border-2 px-5 text-sm font-bold uppercase tracking-widest transition-all ${category === "all"
            ? "border-black bg-brand-500 text-white dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            : "border-transparent bg-white text-slate-600 hover:border-black hover:text-black dark:bg-zinc-900 dark:text-slate-400 dark:hover:border-white dark:hover:text-white"
            }`}
        >
          All Events
        </button>
        <button
          onClick={() => setCategory("music")}
          className={`flex h-10 items-center justify-center border-2 px-5 text-sm font-bold uppercase tracking-widest transition-all ${category === "music"
            ? "border-black bg-brand-500 text-white dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            : "border-transparent bg-white text-slate-600 hover:border-black hover:text-black dark:bg-zinc-900 dark:text-slate-400 dark:hover:border-white dark:hover:text-white"
            }`}
        >
          Music
        </button>
        <button
          onClick={() => setCategory("sports")}
          className={`flex h-10 items-center justify-center border-2 px-5 text-sm font-bold uppercase tracking-widest transition-all ${category === "sports"
            ? "border-black bg-brand-500 text-white dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            : "border-transparent bg-white text-slate-600 hover:border-black hover:text-black dark:bg-zinc-900 dark:text-slate-400 dark:hover:border-white dark:hover:text-white"
            }`}
        >
          Sports
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-black dark:text-white">Available Events</h2>
          <button className="flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
            Sort
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {filteredEvents.map((e) => {
            const isSaved = !!savedMap[e.externalEventId];
            const date = parseISO(e.startTime);

            return (
              <div key={e.externalEventId} className="flex flex-col gap-4 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <div className="relative aspect-video w-full overflow-hidden border-2 border-black bg-slate-100 dark:border-white">
                  <Image
                    src={e.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop"}
                    alt={e.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-1 border-2 border-black bg-poster-yellow px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white">
                    $45+
                  </div>
                  <button
                    onClick={() => onToggleSave(e)}
                    className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center border-2 border-black transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${isSaved ? "bg-brand-500 text-white" : "bg-white text-brand-500 hover:bg-brand-50 dark:bg-zinc-800"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isSaved ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-1 px-2">
                  <h3 className="font-display text-base font-bold uppercase tracking-wide text-black dark:text-white">{e.title}</h3>
                  <div className="flex flex-col gap-1 font-sans text-[13px] font-bold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      {e.venue || "Venue TBA"}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                      {format(date, "eee, MMM dd • h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <div className="fixed bottom-32 left-0 right-0 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-3 border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M12 3v18" /><path d="M17 3v18" /><path d="M3 8h18" /><path d="M3 13h18" /><path d="M3 18h18" /></svg>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-black dark:text-white">Shortlist</h4>
            <span className="flex h-5 w-5 items-center justify-center border-2 border-black bg-brand-400 text-[10px] font-bold text-black dark:border-white">
              {savedEvents.length}
            </span>
          </div>
          <button className="font-display text-[11px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Edit</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {savedEvents.map((e) => (
            <div key={e.id} className="flex min-w-[240px] gap-3 border-2 border-black bg-slate-50 p-2 dark:border-white dark:bg-zinc-800">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden border-2 border-black dark:border-white">
                <Image
                  src={e.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=100&auto=format&fit=crop"}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <span className="truncate font-sans text-xs font-bold text-black dark:text-white">{e.title}</span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{format(parseISO(e.startTime), "eee • h:mm a")}</span>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      {[1, 2].map(i => <div key={i} className="h-4 w-4 border border-black bg-poster-orange dark:border-white" />)}
                    </div>
                    <span className="font-display text-[9px] font-bold uppercase tracking-wider text-slate-500">{e.voteCount} likes</span>
                  </div>
                  <button
                    onClick={() => onUpvote(e.id)}
                    className="flex h-6 items-center gap-1 border-2 border-black bg-brand-500 px-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                    +1
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <StickyFooter className="bg-white/90 backdrop-blur-md dark:bg-background-dark/90">
      <button
        onClick={() => (window.location.href = `/trip/${tripId}/summary`)}
        className="flex h-16 w-full items-center justify-center gap-2 border-4 border-black bg-brand-500 font-display text-lg font-bold uppercase tracking-widest text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        Continue to Summary
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" x2="19" y1="12" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </StickyFooter>
  </div>
);
}

