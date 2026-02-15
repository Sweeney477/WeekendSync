"use client";

import { useEffect, useMemo, useState } from "react";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { Tooltip } from "@/components/ui/Tooltip";
import { AvailabilityRow, type WeekendWithCounts } from "@/components/trip/AvailabilitySection";

type Weekend = WeekendWithCounts & { trip_id: string };

export function AvailabilityClient({ tripId }: { tripId: string }) {
  const [weekends, setWeekends] = useState<Weekend[]>([]);
  const [timeframeMode, setTimeframeMode] = useState<
    "weekend" | "long_weekend" | "week" | "dinner" | "custom"
  >("weekend");
  const [myAvailability, setMyAvailability] = useState<Record<string, "yes" | "maybe" | "no" | "unset">>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "remaining">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const [wRes, aRes] = await Promise.all([
        fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" }),
        fetch(`/api/trip/${tripId}/availability`, { cache: "no-store" }),
      ]);
      const wJson = await wRes.json().catch(() => null);
      if (!wRes.ok) throw new Error(wJson?.error ?? "We couldn’t load dates. Try again.");
      setWeekends(wJson.weekends as Weekend[]);
      if (wJson?.timeframeMode) setTimeframeMode(wJson.timeframeMode);

      const aJson = await aRes.json().catch(() => null);
      if (aRes.ok) {
        const map: Record<string, "yes" | "maybe" | "no" | "unset"> = {};
        for (const r of aJson.availability ?? []) map[r.weekendStart] = r.status as "yes" | "maybe" | "no" | "unset";
        setMyAvailability(map);
      }
      setLoading(false);
    })().catch((e) => {
      setError(e instanceof Error ? e.message : "We couldn’t load dates. Try again.");
      setLoading(false);
    });
  }, [tripId]);

  const filteredWeekends = useMemo(() => {
    if (tab === "all") return weekends;
    return weekends.filter((w) => !myAvailability[w.weekend_start] || myAvailability[w.weekend_start] === "unset");
  }, [tab, weekends, myAvailability]);

  const optionsNoun = useMemo(() => {
    return timeframeMode === "weekend" || timeframeMode === "long_weekend" ? "Weekends" : "Dates";
  }, [timeframeMode]);

  const completion = useMemo(() => {
    const total = weekends.length;
    const filled = Object.values(myAvailability).filter((s) => s !== "unset").length;
    return { total, filled };
  }, [myAvailability, weekends.length]);

  async function setStatus(weekendStart: string, status: "yes" | "maybe" | "no" | "unset") {
    const current = myAvailability[weekendStart] ?? "unset";

    // Don't do anything if selecting the same status
    if (current === status) return;

    setError(null);
    setSavingKey(weekendStart);
    setMyAvailability((prev) => ({ ...prev, [weekendStart]: status }));

    try {
      const res = await fetch(`/api/trip/${tripId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekendStart, status }),
      });
      if (!res.ok) throw new Error("We couldn’t save your availability. Try again.");

      // Refresh weekends to get updated counts
      const wRes = await fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" });
      if (wRes.ok) {
        const wJson = await wRes.json();
        setWeekends(wJson.weekends as Weekend[]);
      }
      // Clear any previous errors on success
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn’t save your availability. Try again.");
      // Revert on error
      setMyAvailability((prev) => ({ ...prev, [weekendStart]: current }));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {error && (
        <div
          className="mx-4 border-2 border-black bg-rose-50 p-3 dark:border-ink-dark/40 dark:bg-rose-900/20"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-rose-600 dark:text-rose-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span className="font-display text-sm font-bold text-rose-700 dark:text-rose-400">{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 px-4 pb-24">
        <div className="flex w-full items-center justify-center gap-2">
          <div className="h-2 w-12 border-2 border-black bg-brand-400 dark:border-ink-dark/40" />
          <div className="h-2 w-2 border-2 border-black bg-white dark:border-ink-dark/40 dark:bg-surface-dark-2" />
          <div className="h-2 w-2 border-2 border-black bg-white dark:border-ink-dark/40 dark:bg-surface-dark-2" />
          <div className="h-2 w-2 border-2 border-black bg-white dark:border-ink-dark/40 dark:bg-surface-dark-2" />
        </div>

        <div className="relative flex w-full border-2 border-black bg-white p-1 dark:border-ink-dark/40 dark:bg-surface-dark-2">
          <div className="absolute -top-8 right-0">
            <Tooltip content="Filter dates to show only the ones you haven't voted on yet." position="left">
              <button type="button" aria-label="Filter dates you have not voted on" className="cursor-help rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">Start here?</button>
            </Tooltip>
          </div>
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2 font-display text-sm font-bold uppercase tracking-wider transition-all ${tab === "all" ? "bg-black text-white dark:bg-white dark:text-black" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
          >
            All {optionsNoun}
          </button>
          <button
            onClick={() => setTab("remaining")}
            className={`flex-1 py-2 font-display text-sm font-bold uppercase tracking-wider transition-all ${tab === "remaining" ? "bg-black text-white dark:bg-white dark:text-black" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
          >
            Remaining
          </button>
        </div>

        <div className="flex w-full flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">Loading dates...</span>
              </div>
            </div>
          ) : filteredWeekends.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">No dates available</span>
            </div>
          ) : (
            filteredWeekends.map((w) => (
              <AvailabilityRow
                key={w.weekend_start}
                weekend={w}
                currentStatus={myAvailability[w.weekend_start] ?? "unset"}
                onStatusChange={(newStatus) => setStatus(w.weekend_start, newStatus)}
                isSaving={savingKey === w.weekend_start}
                showCounts
              />
            ))
          )}
        </div>
      </div>

      <StickyFooter className="bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
        <div className="flex flex-col gap-3">
          <button
            className="flex h-14 w-full items-center justify-center gap-2 border-2 border-black bg-brand-400 font-display text-lg font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_#fff]"
            onClick={() => (window.location.href = `/trip/${tripId}/plan`)}
          >
            Save Availability
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
            You can update your availability anytime while the trip is open.
          </p>
        </div>
      </StickyFooter>
    </div>
  );
}

