"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { format, parseISO } from "date-fns";

type Weekend = { weekend_start: string; weekend_end: string; score: number };
type Destination = { id: string; city_name: string; country_code: string | null; rank_score: number; rationale_tags: string[] };

export function VotingClient({ tripId }: { tripId: string }) {
  const [weekends, setWeekends] = useState<Weekend[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weekendRankings, setWeekendRankings] = useState<string[]>([]);
  const [destinationRankings, setDestinationRankings] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const [wRes, dRes] = await Promise.all([
        fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}/destinations`, { cache: "no-store" }),
      ]);
      const wJson = await wRes.json().catch(() => null);
      const dJson = await dRes.json().catch(() => null);
      if (!wRes.ok) throw new Error(wJson?.error ?? "Failed to load weekends");
      if (!dRes.ok) throw new Error(dJson?.error ?? "Failed to load destinations");

      setWeekends(wJson.weekends ?? []);
      setDestinations(dJson.destinations ?? []);
      setLoading(false);
    })().catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load");
      setLoading(false);
    });
  }, [tripId]);

  const toggleWeekend = (start: string) => {
    setWeekendRankings((prev) => {
      if (prev.includes(start)) return prev.filter((s) => s !== start);
      if (prev.length >= 3) return prev;
      return [...prev, start];
    });
  };

  const toggleDestination = (id: string) => {
    setDestinationRankings((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const wRankMap: Record<string, string> = {};
      weekendRankings.forEach((s, i) => { wRankMap[String(i + 1)] = s; });

      const dRankMap: Record<string, string> = {};
      destinationRankings.forEach((id, i) => { dRankMap[String(i + 1)] = id; });

      await Promise.all([
        fetch(`/api/trip/${tripId}/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType: "weekend", rankings: wRankMap }),
        }),
        fetch(`/api/trip/${tripId}/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType: "destination", rankings: dRankMap }),
        }),
      ]);
      window.location.href = `/trip/${tripId}/summary`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save votes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-10 px-4 pb-40">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-black dark:text-white">Section A: Vote for Weekend</h2>
            <p className="font-sans text-sm text-slate-600 dark:text-slate-300">Select your top 3 choices by priority</p>
          </div>

          <div className="flex flex-col gap-3">
            {weekends.map((w) => {
              const start = parseISO(w.weekend_start);
              const end = parseISO(w.weekend_end);
              const dateRange = `${format(start, "MMM dd")} – ${format(end, "MMM dd")}`;
              const rank = weekendRankings.indexOf(w.weekend_start) + 1;
              const isSelected = rank > 0;

              return (
                <button
                  key={w.weekend_start}
                  onClick={() => toggleWeekend(w.weekend_start)}
                  className={`flex w-full items-center justify-between border-2 p-4 transition-all active:translate-y-0.5 ${isSelected ? "border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]" : "border-black bg-slate-50 opacity-70 hover:opacity-100 dark:border-white dark:bg-zinc-900"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center font-display font-bold text-lg ${isSelected ? "bg-poster-yellow text-black border-2 border-black" : "bg-slate-200 text-slate-400 border-2 border-transparent"
                      }`}>
                      {isSelected ? rank : ""}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-sans font-bold text-black dark:text-white">{dateRange}</span>
                      <span className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">Standard Rate</span>
                    </div>
                  </div>
                  <div className="text-black dark:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="5" r="1" />
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="15" cy="5" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="19" r="1" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-black dark:text-white">Section B: Vote for Destination</h2>
            <p className="font-sans text-sm text-slate-600 dark:text-slate-300">Select your top 3 favorite locations</p>
          </div>

          <div className="flex flex-col gap-3">
            {destinations.map((d) => {
              const rank = destinationRankings.indexOf(d.id) + 1;
              const isSelected = rank > 0;

              return (
                <button
                  key={d.id}
                  onClick={() => toggleDestination(d.id)}
                  className={`flex w-full items-center justify-between border-2 p-4 transition-all active:translate-y-0.5 ${isSelected ? "border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]" : "border-black bg-slate-50 opacity-70 hover:opacity-100 dark:border-white dark:bg-zinc-900"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden border-2 border-black dark:border-white">
                      <Image
                        src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=100&auto=format&fit=crop`}
                        alt={d.city_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-sans font-bold text-black dark:text-white">{d.city_name}</span>
                      <span className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">{d.rationale_tags?.[0] || "Recommended"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="border-2 border-black bg-poster-blue px-2 py-1 font-display text-[10px] font-bold uppercase text-white dark:border-white">
                        Rank {rank}
                      </span>
                    )}
                    {isSelected ? (
                      <div className="flex h-6 w-6 items-center justify-center border-2 border-black bg-poster-green text-black dark:border-white">
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
                    ) : (
                      <div className="h-6 w-6 border-2 border-black bg-white dark:border-white dark:bg-zinc-800" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md dark:bg-zinc-950/90">
        <button
          onClick={onSave}
          disabled={saving || (weekendRankings.length === 0 && destinationRankings.length === 0)}
          className={`flex h-16 w-full items-center justify-center gap-2 border-2 border-black font-display font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_#fff] ${saving ? "bg-slate-300" : "bg-brand-500 hover:bg-black dark:bg-brand-600 dark:hover:bg-white dark:hover:text-black"
            }`}
        >
          {saving ? "Submitting..." : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 13V2" />
                <path d="m18 8-6 5-6-5" />
                <path d="M2 12a10 10 0 0 0 13 9.54" />
                <path d="M22 12a10 10 0 0 0-13-9.54" />
              </svg>
              Submit Vote
            </>
          )}
        </button>
      </StickyFooter>
    </div>
  );
}

