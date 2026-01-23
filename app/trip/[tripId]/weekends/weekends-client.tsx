"use client";

import { useEffect, useState, useMemo } from "react";
import { TripHeader } from "../_components/TripHeader";
import { format, parseISO } from "date-fns";
import { StickyFooter } from "@/components/ui/StickyFooter";

type Weekend = {
  weekend_start: string;
  weekend_end: string;
  score: number;
  counts: { yes: number; maybe: number; no: number; unset: number; total: number };
};

export function WeekendsClient({ tripId }: { tripId: string }) {
  const [weekends, setWeekends] = useState<Weekend[]>([]);
  const [timeframeMode, setTimeframeMode] = useState<
    "weekend" | "long_weekend" | "week" | "dinner" | "custom"
  >("weekend");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "3" | "5">("3");
  const [selectedStarts, setSelectedStarts] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to load weekends");
      setWeekends(json.weekends as Weekend[]);
      if (json?.timeframeMode) setTimeframeMode(json.timeframeMode);
      setLoading(false);
    })().catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load");
      setLoading(false);
    });
  }, [tripId]);

  const optionsNoun = useMemo(() => {
    return timeframeMode === "weekend" || timeframeMode === "long_weekend" ? "Weekends" : "Dates";
  }, [timeframeMode]);

  const filteredWeekends = useMemo(() => {
    if (filter === "all") return weekends;
    const min = parseInt(filter);
    return weekends.filter((w) => w.counts.yes >= min);
  }, [weekends, filter]);

  const toggleSelection = (start: string) => {
    const next = new Set(selectedStarts);
    if (next.has(start)) {
      next.delete(start);
    } else {
      if (next.size >= 5) return;
      next.add(start);
    }
    setSelectedStarts(next);
  };

  const onContinue = async () => {
    if (selectedStarts.size < 2) return;
    // Logic to move to voting: potentially a POST to /api/trip/[tripId]/lock or similar
    // For now, let's just redirect to destinations
    window.location.href = `/trip/${tripId}/destinations`;
  };

  return (
    <div className="flex flex-col gap-6">
      <TripHeader title={`Select Best ${optionsNoun}`} />

      <div className="flex flex-col gap-8 px-4 pb-40">
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Filter by Availability</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("3")}
              className={`flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
                filter === "3" ? "bg-cyan-400 text-white shadow-lg shadow-cyan-100" : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              Min. 3 Yes
            </button>
            <button
              onClick={() => setFilter("5")}
              className={`flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
                filter === "5" ? "bg-cyan-400 text-white shadow-lg shadow-cyan-100" : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              Min. 5 Yes
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
                filter === "all" ? "bg-cyan-400 text-white shadow-lg shadow-cyan-100" : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Ranked Results</h2>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold text-cyan-600">
              Sorted by group overlap
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {filteredWeekends.map((w, idx) => {
              const start = parseISO(w.weekend_start);
              const end = parseISO(w.weekend_end);
              const dateRange = `${format(start, "MMM dd")} – ${format(end, "MMM dd")}`;
              const isSelected = selectedStarts.has(w.weekend_start);
              const isTopPick = idx === 0;
              const total = w.counts.yes + w.counts.maybe + w.counts.no + w.counts.unset;
              const pct = Math.round((w.counts.yes / (total || 1)) * 100);

              return (
                <button
                  key={w.weekend_start}
                  onClick={() => toggleSelection(w.weekend_start)}
                  className={`group relative flex w-full flex-col gap-4 rounded-[32px] border-2 bg-white p-6 text-left transition-all active:scale-[0.98] ${
                    isSelected ? "border-cyan-400" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {isTopPick && (
                    <div className="absolute top-4 right-16 rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      Top Pick
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className={`text-2xl font-bold ${pct < 40 ? "text-slate-300" : "text-slate-900"}`}>
                        {dateRange}
                      </span>
                      <span className={`text-sm font-bold ${pct < 40 ? "text-rose-400 italic" : "text-cyan-400"}`}>
                        {pct >= 80 ? `Perfect for ${pct}% of the group` : pct >= 50 ? "Good overlap" : pct >= 30 ? "Moderate match" : "Low group consensus"}
                      </span>
                    </div>

                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-all ${
                      isSelected ? "bg-cyan-400 border-cyan-400 text-white" : "border-slate-200 text-transparent"
                    }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
                  </div>

                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      {w.counts.yes} Yes
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      {w.counts.maybe} Maybe
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                      {w.counts.no} No
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === 1 ? "bg-cyan-400 w-12" : "bg-slate-200 w-8"
                }`}
              />
            ))}
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {selectedStarts.size} OF 3 SELECTED
            </span>
          </div>

          <button
            onClick={onContinue}
            disabled={selectedStarts.size < 2}
            className={`flex h-16 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
              selectedStarts.size >= 2 ? "bg-cyan-400 shadow-cyan-100" : "bg-slate-300 shadow-none cursor-not-allowed"
            }`}
          >
            Choose {optionsNoun} & Continue
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
          
          <p className="text-center text-[10px] font-medium text-slate-400">
            Select between 2 to 5 options to move to voting.
          </p>
        </div>
      </StickyFooter>
    </div>
  );
}

