"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { WeekendType } from "@/lib/events/types";

const WEEKEND_TYPE_OPTIONS: { value: WeekendType; label: string }[] = [
  { value: "friends", label: "Friends" },
  { value: "concert", label: "Concert" },
  { value: "sports", label: "Sports" },
  { value: "food_bars", label: "Food & Bars" },
  { value: "chill", label: "Chill" },
  { value: "other", label: "Other" },
];

export function WeekendTypeSetupClient({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [weekendType, setWeekendType] = useState<WeekendType | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!weekendType) {
      setError("Please pick a weekend type.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekendType,
          preferencesJson: { weekendType },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        setLoading(false);
        return;
      }
      if (weekendType === "sports") {
        router.push(`/trip/${tripId}/setup/sports-details`);
      } else {
        router.push(`/trip/${tripId}/dashboard`);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-ink-dark">
          What kind of weekend?
        </h1>
        <p className="mt-1 font-sans text-sm text-slate-600 dark:text-muted-dark">
          We’ll tailor the plan to your vibe.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark">
                Weekend type
              </span>
              <div className="group relative">
                <div className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-slate-400">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-black px-3 py-2 text-center font-sans text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800">
                  Helps us suggest activities. Sports trips include game scheduling.
                  <div className="absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-black dark:bg-zinc-800"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {WEEKEND_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWeekendType(opt.value)}
                  className={`h-14 border-2 px-3 font-display text-sm font-bold uppercase tracking-wider transition-colors ${weekendType === opt.value
                      ? "border-black bg-poster-yellow text-black dark:border-poster-yellow dark:bg-poster-yellow dark:text-black"
                      : "border-black bg-white text-black hover:bg-slate-50 dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:text-ink-dark dark:hover:bg-surface-dark"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="border-2 border-black bg-rose-50 p-3 font-medium text-rose-600 dark:border-ink-dark/40 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading || !weekendType} isLoading={loading} className="w-full">
            Continue
          </Button>
        </form>
      </Card>

      <p className="text-center font-sans text-xs text-slate-500 dark:text-muted-dark">
        <Link href={`/trip/${tripId}/dashboard`} className="underline hover:no-underline">
          Skip to dashboard
        </Link>
      </p>
    </div>
  );
}
