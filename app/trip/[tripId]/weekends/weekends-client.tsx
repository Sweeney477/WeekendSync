"use client";

import { useEffect, useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { Skeleton } from "@/components/ui/Skeleton";

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
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not load weekend data. Please refresh.");
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


  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-4 px-4 pb-40">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-40 w-full flex-col justify-between border-2 border-slate-200 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-8 px-4 pb-40">
        <div className="flex flex-col gap-4">
          <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-500">Filter by Availability</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("3")}
              className={`flex h-10 items-center justify-center border-2 border-black px-5 font-display text-sm font-bold uppercase tracking-widest transition-all ${filter === "3" ? "bg-brand-500 text-white dark:border-white" : "bg-white text-slate-400 hover:border-black hover:text-black dark:bg-zinc-900"
                }`}
            >
              Min. 3 Yes
            </button>
            <button
              onClick={() => setFilter("5")}
              className={`flex h-10 items-center justify-center border-2 border-black px-5 font-display text-sm font-bold uppercase tracking-widest transition-all ${filter === "5" ? "bg-brand-500 text-white dark:border-white" : "bg-white text-slate-400 hover:border-black hover:text-black dark:bg-zinc-900"
                }`}
            >
              Min. 5 Yes
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`flex h-10 items-center justify-center border-2 border-black px-5 font-display text-sm font-bold uppercase tracking-widest transition-all ${filter === "all" ? "bg-brand-500 text-white dark:border-white" : "bg-white text-slate-400 hover:border-black hover:text-black dark:bg-zinc-900"
                }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-black dark:text-white">Ranked Results</h2>
            <span className="border-2 border-black bg-poster-yellow px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-black dark:border-white">
              Sorted by overlay
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
                  className={`group relative flex w-full flex-col gap-4 border-2 p-6 text-left transition-all active:translate-y-0.5 ${isSelected ? "border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]" : "border-black bg-slate-50 hover:bg-white dark:border-white dark:bg-zinc-900"
                    }`}
                >
                  {isTopPick && (
                    <div className="absolute top-4 right-16 border-2 border-black bg-poster-green px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-black dark:border-white">
                      Top Pick
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className={`font-sans text-2xl font-bold ${pct < 40 ? "text-slate-300" : "text-black dark:text-white"}`}>
                        {dateRange}
                      </span>
                      <span className={`font-display text-sm font-bold uppercase tracking-wider ${pct < 40 ? "text-rose-400 italic" : "text-brand-500"}`}>
                        {pct >= 80 ? `Perfect for ${pct}% of the group` : pct >= 50 ? "Good overlap" : pct >= 30 ? "Moderate match" : "Low group consensus"}
                      </span>
                    </div>

                    <div className={`flex h-8 w-8 items-center justify-center border-2 transition-all ${isSelected ? "bg-poster-green border-black text-black dark:border-white" : "border-black bg-white dark:border-white dark:bg-zinc-800 text-transparent"
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
                    <div className="flex items-center gap-1.5 border-2 border-black bg-poster-green px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-black dark:border-white">
                      {w.counts.yes} Yes
                    </div>
                    <div className="flex items-center gap-1.5 border-2 border-black bg-poster-yellow px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-black dark:border-white">
                      {w.counts.maybe} Maybe
                    </div>
                    <div className="flex items-center gap-1.5 border-2 border-black bg-poster-orange px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-black dark:border-white">
                      {w.counts.no} No
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md dark:bg-zinc-950/90">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 border-2 border-black transition-all dark:border-white ${i === 1 ? "bg-brand-500 w-12" : "bg-white w-8 dark:bg-zinc-900"
                  }`}
              />
            ))}
            <span className="ml-2 font-display text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {selectedStarts.size} OF 3 SELECTED
            </span>
          </div>

          <button
            onClick={onContinue}
            disabled={selectedStarts.size < 2}
            className={`flex h-16 w-full items-center justify-center gap-2 border-2 border-black font-display font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_#fff] ${selectedStarts.size >= 2 ? "bg-brand-500 hover:bg-black" : "bg-slate-300 shadow-none cursor-not-allowed border-slate-300"
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

          <p className="text-center font-display text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select between 2 to 5 options to move to voting.
          </p>
        </div>
      </StickyFooter>
    </div>
  );
}

