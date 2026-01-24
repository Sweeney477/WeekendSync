"use client";

import { addDays, format, parseISO } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { StickyFooter } from "@/components/ui/StickyFooter";

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
  const [category, setCategory] = useState("all");

  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedMap, setSavedMap] = useState<Record<string, string>>({}); // externalEventId -> db eventId

  async function refreshSaved() {
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
  }

  useEffect(() => {
    (async () => {
      const [tripRes, destRes] = await Promise.all([
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
  }, [tripId]);

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
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-8 px-4 pb-64">
        <div className="flex gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
              category === "all" ? "bg-cyan-400 text-white" : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setCategory("music")}
            className={`flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
              category === "music" ? "bg-cyan-400 text-white" : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            Music
          </button>
          <button
            onClick={() => setCategory("sports")}
            className={`flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
              category === "sports" ? "bg-cyan-400 text-white" : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            Sports
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Available Events</h2>
            <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-cyan-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              Sort
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {filteredEvents.map((e) => {
              const isSaved = !!savedMap[e.externalEventId];
              const date = parseISO(e.startTime);
              
              return (
                <div key={e.externalEventId} className="flex flex-col gap-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-slate-100 shadow-xl">
                    <img src={e.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop"} alt={e.title} className="h-full w-full object-cover" />
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                      $45+
                    </div>
                    <button
                      onClick={() => onToggleSave(e)}
                      className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-[0.9] ${
                        isSaved ? "bg-cyan-400 text-white" : "bg-white text-cyan-400"
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
                    <h3 className="text-xl font-bold text-slate-900">{e.title}</h3>
                    <div className="flex flex-col gap-1 text-[13px] font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {e.venue || "Venue TBA"}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
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
        <div className="flex w-full max-w-md flex-col gap-3 rounded-[32px] bg-white p-4 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M12 3v18"/><path d="M17 3v18"/><path d="M3 8h18"/><path d="M3 13h18"/><path d="M3 18h18"/></svg>
              <h4 className="text-sm font-bold text-slate-900">Group Shortlist</h4>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-bold text-cyan-600">
                {savedEvents.length}
              </span>
            </div>
            <button className="text-[11px] font-bold uppercase tracking-wider text-cyan-500">Edit</button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {savedEvents.map((e) => (
              <div key={e.id} className="flex min-w-[240px] gap-3 rounded-2xl bg-slate-50 p-2">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  <img src={e.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=100&auto=format&fit=crop"} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="truncate text-xs font-bold text-slate-900">{e.title}</span>
                  <span className="text-[10px] text-slate-500">{format(parseISO(e.startTime), "eee • h:mm a")}</span>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        {[1, 2].map(i => <div key={i} className="h-4 w-4 rounded-full border border-white bg-slate-300" />)}
                      </div>
                      <span className="text-[9px] font-medium text-slate-400">{e.voteCount} friends like</span>
                    </div>
                    <button
                      onClick={() => onUpvote(e.id)}
                      className="flex h-6 items-center gap-1 rounded-lg bg-cyan-400 px-2 text-[10px] font-bold text-white transition-all active:scale-[0.9]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                      +1
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md">
        <button
          onClick={() => (window.location.href = `/trip/${tripId}/summary`)}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-bold text-white shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
        >
          Continue to Summary
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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

