"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { TripHeader } from "../_components/TripHeader";
import { format, parseISO, addDays } from "date-fns";
import { StickyFooter } from "@/components/ui/StickyFooter";

type ResultsResponse = {
  weekend: { winnerId: string | null; rounds: any[] };
  destination: { winnerId: string | null; rounds: any[] };
};

type Weekend = { weekend_start: string; weekend_end: string; score: number };
type Destination = { id: string; city_name: string; country_code: string | null; rank_score: number };
type SavedEvent = { id: string; title: string; startTime: string; venue: string | null; url: string | null; voteCount: number };

export function SummaryClient({ tripId }: { tripId: string }) {
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [weekends, setWeekends] = useState<Weekend[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [selectedWeekendStart, setSelectedWeekendStart] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState("");
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [rRes, wRes, dRes, savedRes, myRes, tripRes] = await Promise.all([
        fetch(`/api/trip/${tripId}/results`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}/destinations`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}/events/saved`, { cache: "no-store" }),
        fetch(`/api/my-trips`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}`, { cache: "no-store" }),
      ]);

      if (rRes.ok) setResults((await rRes.json()) as ResultsResponse);
      if (wRes.ok) {
        const wJson = await wRes.json();
        setWeekends(wJson.weekends ?? []);
      }
      if (dRes.ok) {
        const dJson = await dRes.json();
        setDestinations(dJson.destinations ?? []);
      }
      if (savedRes.ok) {
        const sJson = await savedRes.json();
        setSavedEvents((sJson.events ?? []) as SavedEvent[]);
      }
      if (myRes.ok) {
        const myJson = await myRes.json();
        const t = (myJson.trips ?? []).find((x: any) => x.id === tripId);
        setRole(t?.role ?? null);
      }
      if (tripRes.ok) {
        const tJson = await tripRes.json();
        setIsLocked(tJson.trip.status === "locked");
        if (tJson.trip.selectedWeekendStart) setSelectedWeekendStart(tJson.trip.selectedWeekendStart);
        if (tJson.trip.selectedDestinationId) setSelectedDestinationId(tJson.trip.selectedDestinationId);
      }
    })().catch(() => { });
  }, [tripId]);

  const winningWeekend = weekends.find((w) => w.weekend_start === selectedWeekendStart);
  const winningDestination = destinations.find((d) => d.id === selectedDestinationId);

  async function toggleLock() {
    if (role !== "organizer") return;
    setLocking(true);
    try {
      const res = await fetch(`/api/trip/${tripId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedWeekendStart: selectedWeekendStart || results?.weekend?.winnerId,
          selectedDestinationId: selectedDestinationId || results?.destination?.winnerId
        }),
      });
      if (res.ok) setIsLocked(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLocking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TripHeader title="Final Plan Summary" />

      <div className="flex flex-col gap-8 px-4 pb-48">
        <Card className="flex flex-col gap-4 rounded-[32px] border-none bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-cyan-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Plan Locked</h2>
            </div>
            <button
              onClick={toggleLock}
              disabled={role !== "organizer" || locking}
              className={`relative h-8 w-14 rounded-full transition-all ${isLocked ? "bg-cyan-400" : "bg-slate-200"
                }`}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${isLocked ? "left-7" : "left-1"
                  }`}
              />
            </button>
          </div>
          <p className="text-sm font-medium text-cyan-600">This trip is finalized and ready to go!</p>
        </Card>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-900">The Weekend</h3>
          <Card className="flex items-center justify-between rounded-[32px] border-none bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">Confirmed Dates</span>
              <span className="text-xl font-bold text-slate-900">
                {selectedWeekendStart ? format(parseISO(selectedWeekendStart), "MMM dd") : "TBA"} –{" "}
                {selectedWeekendStart ? format(addDays(parseISO(selectedWeekendStart), 2), "MMM dd, yyyy") : ""}
              </span>
              <span className="text-sm font-medium text-slate-400">Friday – Sunday • 2 Nights</span>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-100 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
            </div>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-900">The Destination</h3>
          <Card className="flex items-center justify-between rounded-[32px] border-none bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">Location</span>
              <span className="text-xl font-bold text-slate-900">{winningDestination?.city_name || "TBA"}</span>
              <span className="text-sm font-medium text-slate-400">The Live Music Capital of the World</span>
            </div>
            <div className="relative h-16 w-16 overflow-hidden rounded-[24px] bg-slate-100">
              <Image src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=100&auto=format&fit=crop" alt="" fill className="object-cover" />
            </div>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-900">Top 3 Events</h3>
          <div className="flex flex-col gap-3">
            {savedEvents.slice(0, 3).map((e, i) => (
              <div key={e.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm border border-slate-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500 font-bold">
                  #{i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">{e.title}</span>
                  <span className="text-xs text-slate-400">{format(parseISO(e.startTime), "EEEE, h:mm a")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md">
        <div className="flex flex-col gap-3">
          <a
            href={`/api/trip/${tripId}/calendar.ics`}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-bold text-white shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
            Download Calendar (.ics)
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/join/${tripId}`);
              alert("Link copied!");
            }}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 font-bold text-slate-900 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
            Share Plan Link
          </button>
        </div>
      </StickyFooter>
    </div>
  );
}

