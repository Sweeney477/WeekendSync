"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { format, parseISO } from "date-fns";

type Weekend = {
  trip_id: string;
  weekend_start: string;
  weekend_end: string;
  score: number;
  counts: { yes: number; maybe: number; no: number; unset: number; total: number };
};

function AvailabilityCounts({ counts }: { counts: { yes: number; maybe: number; no: number; unset: number; total: number } }) {
  return (
    <div className="flex items-center gap-2">
      {counts.yes > 0 && (
        <div className="flex items-center gap-1 border-2 border-black bg-poster-green px-2 py-0.5 dark:border-ink-dark/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black dark:text-ink-dark"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-display text-[10px] font-bold text-black dark:text-ink-dark">{counts.yes}</span>
        </div>
      )}
      {counts.maybe > 0 && (
        <div className="flex items-center gap-1 border-2 border-black bg-poster-yellow px-2 py-0.5 dark:border-ink-dark/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black dark:text-ink-dark"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12" y1="17" y2="17" />
          </svg>
          <span className="font-display text-[10px] font-bold text-black dark:text-ink-dark">{counts.maybe}</span>
        </div>
      )}
      {counts.no > 0 && (
        <div className="flex items-center gap-1 border-2 border-black bg-poster-orange px-2 py-0.5 dark:border-ink-dark/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black dark:text-ink-dark"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" x2="9" y1="9" y2="15" />
            <line x1="9" x2="15" y1="9" y2="15" />
          </svg>
          <span className="font-display text-[10px] font-bold text-black dark:text-ink-dark">{counts.no}</span>
        </div>
      )}
      {counts.yes === 0 && counts.maybe === 0 && counts.no === 0 && (
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-400">No votes yet</span>
      )}
    </div>
  );
}

function SegmentedAvailabilityControl({
  currentStatus,
  onSelect,
  disabled,
}: {
  currentStatus: "yes" | "maybe" | "no" | "unset";
  onSelect: (status: "yes" | "maybe" | "no" | "unset") => void;
  disabled?: boolean;
}) {
  const options: Array<{ value: "yes" | "maybe" | "no" | "unset"; label: string; icon: ReactNode; bg: string; text: string }> = [
    {
      value: "yes",
      label: "Yes",
      bg: "bg-poster-green border-black",
      text: "text-black",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      value: "maybe",
      label: "Maybe",
      bg: "bg-poster-yellow border-black",
      text: "text-black",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" x2="12" y1="17" y2="17" />
        </svg>
      ),
    },
    {
      value: "no",
      label: "No",
      bg: "bg-poster-orange border-black",
      text: "text-black",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-0 border-2 border-black bg-white p-0.5 dark:border-ink-dark/40 dark:bg-surface-dark-2">
      {options.map((opt) => {
        const isSelected = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${isSelected ? `${opt.bg} border-2 ${opt.text} shadow-[2px_2px_0px_0px_#000]` : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

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

        <div className="flex w-full border-2 border-black bg-white p-1 dark:border-ink-dark/40 dark:bg-surface-dark-2">
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
            filteredWeekends.map((w) => {
              const start = parseISO(w.weekend_start);
              const end = parseISO(w.weekend_end);
              const dateRange =
                w.weekend_start === w.weekend_end
                  ? format(start, "MMM dd")
                  : `${format(start, "MMM dd")} – ${format(end, "MMM dd")}`;
              const weekdayRange =
                w.weekend_start === w.weekend_end
                  ? format(start, "EEEE")
                  : `${format(start, "EEEE")} – ${format(end, "EEEE")}`;
              const status = myAvailability[w.weekend_start] ?? "unset";
              const isSaving = savingKey === w.weekend_start;

              return (
                <div key={w.weekend_start} className="flex flex-col gap-3 border-b-2 border-black pb-4 dark:border-ink-dark/40">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-sans text-lg font-bold text-black dark:text-white">{dateRange}</span>
                      <span className="font-display text-xs font-bold uppercase tracking-widest text-brand-500">{weekdayRange}</span>
                    </div>
                    {w.score > 0 && (
                      <div className="flex items-center gap-1 border-2 border-black bg-poster-blue px-2.5 py-1 dark:border-ink-dark/40">
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white">Score: {w.score}</span>
                      </div>
                    )}
                  </div>
                  <AvailabilityCounts counts={w.counts} />
                  <SegmentedAvailabilityControl
                    currentStatus={status}
                    onSelect={(newStatus) => setStatus(w.weekend_start, newStatus)}
                    disabled={isSaving}
                  />
                  {isSaving && (
                    <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span>Saving...</span>
                    </div>
                  )}
                </div>
              );
            })
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

