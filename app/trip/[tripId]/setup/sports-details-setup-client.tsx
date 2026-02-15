"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addMonths, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

type WeekendOption = { weekendStart: string; weekendEnd: string; gameCount: number };

type Mode = "dates" | "game_weekends";

export function SportsDetailsSetupClient({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<{ firstDate?: string | null; selectedCity?: string | null; preferencesJson?: { sports?: { dateWindowStart?: string; dateWindowEnd?: string } } | null } | null>(null);
  const [mode, setMode] = useState<Mode>("dates");
  const [dateWindowStart, setDateWindowStart] = useState("");
  const [dateWindowEnd, setDateWindowEnd] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gameWeekends, setGameWeekends] = useState<WeekendOption[]>([]);
  const [loadingWeekends, setLoadingWeekends] = useState(false);
  const [replaceLoading, setReplaceLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/trip/${tripId}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.trip) {
        setTrip(data.trip);
        const start = data.trip.preferencesJson?.sports?.dateWindowStart;
        const end = data.trip.preferencesJson?.sports?.dateWindowEnd;
        if (start) setDateWindowStart(start);
        if (end) setDateWindowEnd(end);
        if (!start || !end) {
          const baseDate = data.trip.firstDate
            ? (() => {
                try {
                  return parseISO(data.trip.firstDate);
                } catch {
                  return new Date();
                }
              })()
            : new Date();
          setDateWindowStart(toDateOnly(baseDate));
          setDateWindowEnd(toDateOnly(addMonths(baseDate, 1)));
        }
      }
    })();
  }, [tripId]);

  async function handleFindGameWeekends() {
    const city = trip?.selectedCity?.trim();
    if (!city) {
      setError("City is required. Go back and set your city first.");
      return;
    }
    setError(null);
    setLoadingWeekends(true);
    try {
      const url = new URL(`/api/trip/${tripId}/events/available-weekends`, window.location.origin);
      url.searchParams.set("city", city);
      url.searchParams.set("sport", "baseball");
      url.searchParams.set("windowStart", trip?.firstDate ?? toDateOnly(new Date()));
      if (teamQuery.trim()) url.searchParams.set("team", teamQuery.trim());
      const res = await fetch(url.toString());
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not load game weekends. Try a different city or team.");
        setGameWeekends([]);
        return;
      }
      setGameWeekends(data.weekends ?? []);
      if (!data.weekends?.length) {
        setError("No game weekends found. Try a wider search or different city.");
      }
    } catch {
      setError("Something went wrong. Try again.");
      setGameWeekends([]);
    } finally {
      setLoadingWeekends(false);
    }
  }

  async function handleUseGameWeekends() {
    if (gameWeekends.length === 0) return;
    setError(null);
    setReplaceLoading(true);
    try {
      const weekends = gameWeekends.map((w) => ({ weekendStart: w.weekendStart, weekendEnd: w.weekendEnd }));
      const replaceRes = await fetch(`/api/trip/${tripId}/weekends/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekends }),
      });
      const replaceData = await replaceRes.json().catch(() => ({}));
      if (!replaceRes.ok) {
        setError(replaceData.error ?? "Could not save weekend options.");
        setReplaceLoading(false);
        return;
      }
      await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferencesJson: {
            weekendType: "sports",
            sports: {
              sport: "baseball",
              teamQuery: teamQuery.trim() || undefined,
              dateWindowStart: gameWeekends[0]?.weekendStart,
              dateWindowEnd: gameWeekends[gameWeekends.length - 1]?.weekendEnd,
            },
          },
        }),
      });
      router.push(`/trip/${tripId}/dashboard`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setReplaceLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const start = dateWindowStart.trim();
    const end = dateWindowEnd.trim();
    if (!start || !end) {
      setError("Please set the date window.");
      return;
    }
    const startD = new Date(start);
    const endD = new Date(end);
    if (endD < startD) {
      setError("End date must be on or after start date.");
      return;
    }
    const days = (endD.getTime() - startD.getTime()) / (24 * 60 * 60 * 1000);
    if (days > 90) {
      setError("Date window cannot exceed 90 days.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferencesJson: {
            weekendType: "sports",
            sports: {
              sport: "baseball",
              teamQuery: teamQuery.trim() || undefined,
              dateWindowStart: start,
              dateWindowEnd: end,
            },
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        setLoading(false);
        return;
      }
      router.push(`/trip/${tripId}/setup/games`);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-ink-dark">
          Baseball weekend
        </h1>
        <p className="mt-1 font-sans text-sm text-slate-600 dark:text-muted-dark">
          When are you free? We’ll find home games in {trip?.selectedCity ?? "your city"}.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark">
          How do you want to pick dates?
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("dates")}
            className={`h-14 border-2 px-4 text-left font-display text-sm font-bold uppercase tracking-wider transition-colors ${
              mode === "dates"
                ? "border-black bg-poster-yellow text-black dark:border-poster-yellow dark:bg-poster-yellow dark:text-black"
                : "border-black bg-white text-black hover:bg-slate-50 dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:text-ink-dark dark:hover:bg-surface-dark"
            }`}
          >
            I have specific dates
          </button>
          <button
            type="button"
            onClick={() => setMode("game_weekends")}
            className={`h-14 border-2 px-4 text-left font-display text-sm font-bold uppercase tracking-wider transition-colors ${
              mode === "game_weekends"
                ? "border-black bg-poster-yellow text-black dark:border-poster-yellow dark:bg-poster-yellow dark:text-black"
                : "border-black bg-white text-black hover:bg-slate-50 dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:text-ink-dark dark:hover:bg-surface-dark"
            }`}
          >
            Only show dates when a game is in town
          </button>
        </div>
      </div>

      {mode === "game_weekends" ? (
        <Card className="flex flex-col gap-4">
          <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
            We’ll find weekends with home games. Your group will then pick from these dates.
          </p>
          <div className="flex flex-col gap-2">
            <label htmlFor="teamGameWeekends" className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark">
              Team (optional)
            </label>
            <input
              id="teamGameWeekends"
              type="text"
              placeholder="e.g. Cubs, Red Sox"
              value={teamQuery}
              onChange={(e) => setTeamQuery(e.target.value)}
              className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-ink-dark/40 dark:text-ink-dark dark:focus:border-poster-yellow"
              maxLength={120}
            />
          </div>
          <Button
            type="button"
            onClick={handleFindGameWeekends}
            disabled={loadingWeekends || !trip?.selectedCity}
            isLoading={loadingWeekends}
            className="w-full"
          >
            Find weekends with games
          </Button>
          {gameWeekends.length > 0 && (
            <>
              <ul className="flex flex-col gap-2 border-t-2 border-black pt-4 dark:border-ink-dark/40" aria-label="Weekends with games">
                {gameWeekends.map((w) => {
                  const start = parseISO(w.weekendStart);
                  const end = parseISO(w.weekendEnd);
                  return (
                    <li key={w.weekendStart} className="font-sans text-sm font-medium text-black dark:text-ink-dark">
                      {format(start, "EEE, MMM d")} – {format(end, "EEE, MMM d")} · {w.gameCount} {w.gameCount === 1 ? "game" : "games"}
                    </li>
                  );
                })}
              </ul>
              <Button
                type="button"
                onClick={handleUseGameWeekends}
                disabled={replaceLoading}
                isLoading={replaceLoading}
                className="w-full"
              >
                Use these dates & continue
              </Button>
            </>
          )}
          {error && (
            <p className="border-2 border-black bg-rose-50 p-3 font-medium text-rose-600 dark:border-ink-dark/40 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}
        </Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="dateStart" className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark">
                Date window start
              </label>
              <input
                id="dateStart"
                type="date"
                value={dateWindowStart}
                onChange={(e) => setDateWindowStart(e.target.value)}
                className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-ink-dark/40 dark:text-ink-dark dark:focus:border-poster-yellow"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dateEnd" className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark">
                Date window end
              </label>
              <input
                id="dateEnd"
                type="date"
                value={dateWindowEnd}
                onChange={(e) => setDateWindowEnd(e.target.value)}
                className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-ink-dark/40 dark:text-ink-dark dark:focus:border-poster-yellow"
              />
              <p className="text-xs text-slate-500 dark:text-muted-dark">Up to 90 days.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="team" className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark">
                Team (optional)
              </label>
              <input
                id="team"
                type="text"
                placeholder="e.g. Cubs, Red Sox"
                value={teamQuery}
                onChange={(e) => setTeamQuery(e.target.value)}
                className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-ink-dark/40 dark:text-ink-dark dark:focus:border-poster-yellow"
                maxLength={120}
              />
            </div>
            {error && (
              <p className="border-2 border-black bg-rose-50 p-3 font-medium text-rose-600 dark:border-ink-dark/40 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} isLoading={loading} className="w-full">
              Find games
            </Button>
          </form>
        </Card>
      )}

      <p className="text-center font-sans text-xs text-slate-500 dark:text-muted-dark">
        <Link href={`/trip/${tripId}/dashboard`} className="underline hover:no-underline">
          Skip to dashboard
        </Link>
      </p>
    </div>
  );
}
