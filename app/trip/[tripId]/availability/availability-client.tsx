"use client";

import { useEffect, useMemo, useState } from "react";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { TripHeader } from "../_components/TripHeader";
import { format, parseISO } from "date-fns";

type Weekend = {
  trip_id: string;
  weekend_start: string;
  weekend_end: string;
  score: number;
  counts: { yes: number; maybe: number; no: number; unset: number; total: number };
};

function StatusButton({
  status,
  onClick,
  disabled,
}: {
  status: "yes" | "maybe" | "no" | "unset";
  onClick: () => void;
  disabled?: boolean;
}) {
  const configs = {
    yes: {
      label: "YES",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    maybe: {
      label: "MAYBE",
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
    no: {
      label: "NO",
      bg: "bg-rose-100",
      text: "text-rose-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
    unset: {
      label: "UNSET",
      bg: "bg-white border-2 border-dashed border-slate-200",
      text: "text-slate-400",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
  };

  const config = configs[status];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-28 items-center justify-center gap-2 rounded-full font-bold transition-all active:scale-[0.95] ${config.bg} ${config.text}`}
    >
      {config.icon}
      <span className="text-xs tracking-wider">{config.label}</span>
    </button>
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

  async function cycleStatus(weekendStart: string) {
    const current = myAvailability[weekendStart] ?? "unset";
    const nextMap: Record<string, "yes" | "maybe" | "no" | "unset"> = {
      unset: "yes",
      yes: "maybe",
      maybe: "no",
      no: "unset",
    };
    const next = nextMap[current];
    
    setError(null);
    setSavingKey(weekendStart);
    setMyAvailability((prev) => ({ ...prev, [weekendStart]: next }));
    
    try {
      const res = await fetch(`/api/trip/${tripId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekendStart, status: next }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      // Revert on error
      setMyAvailability((prev) => ({ ...prev, [weekendStart]: current }));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TripHeader title="Mark Availability" />

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
          {filteredWeekends.map((w) => {
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
              <div key={w.weekend_start} className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900">{dateRange}</span>
                  <span className="text-sm font-medium text-brand-500">{weekdayRange}</span>
                </div>
                <StatusButton status={status} onClick={() => cycleStatus(w.weekend_start)} disabled={isSaving} />
              </div>
            );
          })}
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
            You can update this anytime before the group lock date.
          </p>
        </div>
      </StickyFooter>
    </div>
  );
}

