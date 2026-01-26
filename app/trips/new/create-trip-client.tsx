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

    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 bg-background-light px-6 py-12 pb-24 dark:bg-background-dark">
      <header className="flex flex-col gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6" /></svg>
          Back to Home
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-black dark:text-white">Create a Trip</h1>
          <p className="font-sans text-sm font-medium text-slate-500 dark:text-slate-400">Plan the perfect getaway with your friends.</p>
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-6 border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[8px_8px_0px_0px_#fff]">
        <div className="absolute -right-2 -top-2 h-4 w-4 bg-poster-yellow border-2 border-black dark:border-white"></div>
        <div className="absolute -left-2 -bottom-2 h-4 w-4 bg-poster-blue border-2 border-black dark:border-white"></div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Trip Name</label>
              <input
                placeholder="e.g. Summer Cabin 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="h-14 w-full border-2 border-black bg-transparent px-4 font-display text-xl font-bold uppercase tracking-wider placeholder:text-slate-300 focus:border-primary focus:ring-0 dark:border-white dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-poster-yellow"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">First Date</label>
              <input
                type="date"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
                required
                className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-white dark:text-white dark:focus:border-poster-yellow"
              />
              <p className="text-xs text-slate-500">The earliest date we should consider.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Trip Type</label>
              <div className="relative">
                <select
                  value={timeframeMode}
                  onChange={(e) => setTimeframeMode(e.target.value as typeof timeframeMode)}
                  className="h-14 w-full appearance-none border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-white dark:text-white dark:focus:border-poster-yellow"
                >
                  <option value="weekend">Weekend Trip (Fri – Sun)</option>
                  <option value="long_weekend">Long Weekend (Thurs – Mon)</option>
                  <option value="week">Week-long Trip (Mon – Sun)</option>
                  <option value="dinner">Dinner (one date)</option>
                  <option value="custom">Custom (set number of days)</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
              <p className="text-xs text-slate-500">This controls how many consecutive days each option spans.</p>
            </div>

            {timeframeMode === "custom" ? (
              <div className="flex flex-col gap-2">
                <label className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Trip Length (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={customTripLengthDays}
                  onChange={(e) => setCustomTripLengthDays(parseInt(e.target.value) || 0)}
                  required
                  className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-white dark:text-white dark:focus:border-poster-yellow"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Planning Window (Weeks)</label>
              <input
                type="number"
                min={1}
                max={52}
                value={lookaheadWeeks}
                onChange={(e) => setLookaheadWeeks(parseInt(e.target.value) || 0)}
                required
                className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-white dark:text-white dark:focus:border-poster-yellow"
              />
              <p className="text-xs text-slate-500">How many weekly options should we generate?</p>
            </div>
          </div>

          <button
            type="submit"
            className="group flex h-14 w-full items-center justify-center gap-2 bg-primary font-display text-xl font-bold uppercase tracking-widest text-white transition-all hover:bg-black active:translate-y-1 disabled:opacity-50"
            disabled={
              isLoading ||
              !name ||
              !firstDate ||
              lookaheadWeeks < 1 ||
              lookaheadWeeks > 52 ||
              !isTripLengthValid
            }
          >
            {isLoading ? (
              "Creating..."
            ) : (
              <>
                Create Trip
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </>
            )}
          </button>

          {error && (
            <div className="border-2 border-black bg-rose-50 p-3 font-medium text-rose-600 dark:border-white dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </div>
          )}
        </form>
      </div>

      <div className="flex flex-col gap-4 px-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-slate-400">How it works</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-poster-yellow font-display text-sm font-bold text-black dark:border-white">1</div>
            <p className="font-sans text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">Create the trip and get a unique invite link for your group.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-poster-green font-display text-sm font-bold text-white dark:border-white">2</div>
            <p className="font-sans text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">Friends join and mark which weekends they are available.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-poster-blue font-display text-sm font-bold text-white dark:border-white">3</div>
            <p className="font-sans text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">Sync up on the best dates and start picking destinations!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
