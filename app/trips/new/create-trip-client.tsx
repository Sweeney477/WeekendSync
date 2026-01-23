"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function CreateTripClient() {
  const [name, setName] = useState("");
  const [lookaheadWeeks, setLookaheadWeeks] = useState(12);
  const [firstDate, setFirstDate] = useState(() => {
    // yyyy-mm-dd in the user's local timezone
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [timeframeMode, setTimeframeMode] = useState<
    "weekend" | "long_weekend" | "week" | "dinner" | "custom"
  >("weekend");
  const [customTripLengthDays, setCustomTripLengthDays] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tripLengthDays =
    timeframeMode === "weekend"
      ? 3
      : timeframeMode === "long_weekend"
        ? 5
        : timeframeMode === "week"
          ? 7
          : timeframeMode === "dinner"
            ? 1
            : customTripLengthDays;

  const isTripLengthValid =
    Number.isInteger(tripLengthDays) && tripLengthDays >= 1 && tripLengthDays <= 30;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          firstDate,
          planningWindowWeeks: lookaheadWeeks,
          timeframeMode,
          tripLengthDays,
        }),
      });

      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Failed to create trip");

      if (!json.trip?.id) {
        throw new Error("No trip ID returned from server");
      }

      const tripUrl = `/trip/${json.trip.id}/dashboard`;
      
      // Use window.location for a hard redirect to ensure the trip page loads fresh
      window.location.href = tripUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 bg-slate-50 px-6 py-12 pb-24 font-sans text-slate-900">
      <header className="flex flex-col gap-4">
        <Link 
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create a Trip</h1>
          <p className="text-sm text-slate-500">Plan the perfect getaway with your friends.</p>
        </div>
      </header>

      <Card className="flex flex-col gap-6 rounded-[32px] border-none p-8 shadow-sm bg-white">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Input
              label="Trip Name"
              placeholder="e.g. Summer Cabin 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="h-14"
            />

            <div className="flex flex-col gap-2">
              <Input
                label="First Date"
                type="date"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
                hint="The earliest date we should consider."
                required
                className="h-14"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900">Trip Type</label>
              <select
                value={timeframeMode}
                onChange={(e) => setTimeframeMode(e.target.value as typeof timeframeMode)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <option value="weekend">Weekend Trip (Fri – Sun)</option>
                <option value="long_weekend">Long Weekend (Thurs – Mon)</option>
                <option value="week">Week-long Trip (Mon – Sun)</option>
                <option value="dinner">Dinner (one date)</option>
                <option value="custom">Custom (set number of days)</option>
              </select>
              <p className="text-xs text-slate-500">This controls how many consecutive days each option spans.</p>
            </div>

            {timeframeMode === "custom" ? (
              <div className="flex flex-col gap-2">
                <Input
                  label="Trip Length (Days)"
                  type="number"
                  min={1}
                  max={30}
                  value={customTripLengthDays}
                  onChange={(e) => setCustomTripLengthDays(parseInt(e.target.value) || 0)}
                  hint="How many consecutive days should each option include?"
                  required
                  className="h-14"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Input
                label="Planning Window (Weeks)"
                type="number"
                min={1}
                max={52}
                value={lookaheadWeeks}
                onChange={(e) => setLookaheadWeeks(parseInt(e.target.value) || 0)}
                hint="How many weekly options should we generate starting from the First Date?"
                required
                className="h-14"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-14 w-full rounded-2xl bg-brand-400 text-lg font-bold shadow-lg shadow-brand-200 transition-all hover:bg-brand-500 active:scale-[0.98]"
            isLoading={isLoading}
            disabled={
              !name ||
              !firstDate ||
              lookaheadWeeks < 1 ||
              lookaheadWeeks > 52 ||
              !isTripLengthValid
            }
          >
            Create Trip
          </Button>

          {error && (
            <p className="text-center text-sm font-medium text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
              {error}
            </p>
          )}
        </form>
      </Card>
      
      <div className="flex flex-col gap-4 px-2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">How it works</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600">1</div>
            <p className="text-xs text-slate-500 leading-relaxed">Create the trip and get a unique invite link for your group.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600">2</div>
            <p className="text-xs text-slate-500 leading-relaxed">Friends join and mark which weekends they are available.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600">3</div>
            <p className="text-xs text-slate-500 leading-relaxed">Sync up on the best dates and start picking destinations!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
