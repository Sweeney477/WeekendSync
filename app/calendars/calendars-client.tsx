"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

type Trip = {
  id: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
  status: string;
  role: string;
  selectedWeekendStart: string | null;
};

type MyTripsResponse = { trips: Trip[] };

export function CalendarsClient() {
  const [myTrips, setMyTrips] = useState<MyTripsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my-trips", { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as MyTripsResponse;
          setMyTrips(json);
        } else {
          setMyTrips({ trips: [] });
        }
      } catch {
        setMyTrips({ trips: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trips = myTrips?.trips ?? [];

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col p-6">
      <div className="flex-grow">
        <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight">
          Calendars
        </h1>

        {loading ? (
          <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">Loading…</p>
        ) : trips.length === 0 ? (
          <p className="mb-6 font-sans text-sm text-slate-600 dark:text-muted-dark">
            No trips yet. Create or join a trip to mark your availability.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex flex-col gap-2 border-2 border-black bg-white p-4 dark:border-ink-dark/40 dark:bg-surface-dark"
              >
                <span className="font-display font-bold uppercase tracking-wider">{trip.name}</span>
                <p className="font-sans text-xs text-slate-600 dark:text-muted-dark">
                  {trip.selectedWeekendStart
                    ? format(parseISO(trip.selectedWeekendStart), "MMM d, yyyy")
                    : "Select dates"}
                </p>
                <Link
                  href={`/trip/${trip.id}/availability`}
                  className="inline-flex w-fit items-center gap-2 border-2 border-black bg-poster-green px-4 py-2 font-display text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-black dark:border-ink-dark/40 dark:hover:bg-surface-dark-2"
                >
                  Mark availability
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
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && trips.length === 0 && (
          <Link
            href="/"
            className="mt-6 inline-block font-display text-sm font-bold uppercase tracking-wider text-primary underline"
          >
            Create or join a trip
          </Link>
        )}
      </div>

      <div className="fixed top-0 left-0 h-full w-2 flex flex-col">
        <div className="flex-1 bg-poster-orange" />
        <div className="flex-1 bg-poster-yellow" />
        <div className="flex-1 bg-poster-green" />
        <div className="flex-1 bg-poster-blue" />
      </div>
    </main>
  );
}
