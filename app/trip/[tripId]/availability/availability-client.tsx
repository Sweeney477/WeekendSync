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
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
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
            className="text-emerald-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-[10px] font-bold text-emerald-700">{counts.yes}</span>
        </div>
      )}
      {counts.maybe > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
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
            className="text-amber-600"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12" y1="17" y2="17" />
          </svg>
          <span className="text-[10px] font-bold text-amber-700">{counts.maybe}</span>
        </div>
      )}
      {counts.no > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5">
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
            className="text-rose-600"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" x2="9" y1="9" y2="15" />
            <line x1="9" x2="15" y1="9" y2="15" />
          </svg>
          <span className="text-[10px] font-bold text-rose-700">{counts.no}</span>
        </div>
      )}
      {counts.yes === 0 && counts.maybe === 0 && counts.no === 0 && (
        <span className="text-[10px] font-medium text-slate-400">No votes yet</span>
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
      bg: "bg-emerald-100",
      text: "text-emerald-700",
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
      bg: "bg-amber-100",
      text: "text-amber-700",
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
      bg: "bg-rose-100",
      text: "text-rose-700",
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
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      {options.map((opt) => {
        const isSelected = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg font-bold text-xs transition-all active:scale-[0.95] ${
              isSelected ? `${opt.bg} ${opt.text} shadow-sm` : "text-slate-500 hover:bg-slate-50"
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
      if (!wRes.ok) throw new Error(wJson?.error ?? "Failed to load weekends");
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
      setError(e instanceof Error ? e.message : "Failed to load");
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
      if (!res.ok) throw new Error("Failed to save");
      
      // Refresh weekends to get updated counts
      const wRes = await fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" });
      if (wRes.ok) {
        const wJson = await wRes.json();
        setWeekends(wJson.weekends as Weekend[]);
      }
      // Clear any previous errors on success
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      // Revert on error
      setMyAvailability((prev) => ({ ...prev, [weekendStart]: current }));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {error && (
        <div className="mx-4 rounded-xl bg-rose-50 border border-rose-200 p-3">
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
              className="text-rose-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span className="text-sm font-medium text-rose-700">{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 px-4 pb-24">
        <div className="flex w-full items-center justify-center gap-1.5">
          <div className="h-1.5 w-12 rounded-full bg-brand-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="flex w-full rounded-2xl bg-slate-200/50 p-1">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
              tab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            All {optionsNoun}
          </button>
          <button
            onClick={() => setTab("remaining")}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
              tab === "remaining" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Remaining
          </button>
        </div>

        <div className="flex w-full flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="h-6 w-6 animate-spin text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-slate-400">Loading dates...</span>
              </div>
            </div>
          ) : filteredWeekends.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-slate-400">No dates available</span>
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
              <div key={w.weekend_start} className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-900">{dateRange}</span>
                    <span className="text-sm font-medium text-brand-500">{weekdayRange}</span>
                  </div>
                  {w.score > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1">
                      <span className="text-[10px] font-bold text-cyan-700">Score: {w.score}</span>
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
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg
                      className="h-3 w-3 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving...</span>
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>

      <StickyFooter className="bg-white/80 backdrop-blur-md">
        <div className="flex flex-col gap-3">
          <button
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-400 font-bold text-white shadow-lg active:scale-[0.98]"
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
          <p className="text-center text-[10px] font-medium text-slate-400">
            You can update your availability anytime while the trip is open.
          </p>
        </div>
      </StickyFooter>
    </div>
  );
}

