"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { endOfWeek, startOfWeek } from "date-fns";

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

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trip/${trip.id}/plan`}
      className="group flex items-center justify-between border-2 border-black bg-white p-4 transition-all hover:bg-poster-yellow dark:border-ink-dark/40 dark:bg-surface-dark dark:hover:bg-poster-yellow dark:hover:text-black"
    >
      <div className="flex flex-col">
        <span className="font-display font-bold uppercase tracking-wider">{trip.name}</span>
        <span className="font-sans text-xs font-bold uppercase opacity-60">
          {trip.role === "organizer" ? "Organizer" : "Participant"}
        </span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:translate-x-1"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

function TripSection({
  title,
  trips,
  emptyMessage,
}: {
  title: string;
  trips: Trip[];
  emptyMessage: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-tight">{title}</h2>
      {trips.length === 0 ? (
        <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}

export function TripsClient() {
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

  const { upcoming, current, past } = useMemo(() => {
    const trips = myTrips?.trips ?? [];
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    const upcoming: Trip[] = [];
    const current: Trip[] = [];
    const past: Trip[] = [];

    for (const t of trips) {
      const d = t.selectedWeekendStart ? new Date(t.selectedWeekendStart) : null;
      if (d == null) {
        upcoming.push(t);
      } else if (d < weekStart) {
        past.push(t);
      } else if (d >= weekStart && d <= weekEnd) {
        current.push(t);
      } else {
        upcoming.push(t);
      }
    }

    return { upcoming, current, past };
  }, [myTrips?.trips]);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col p-6">
      <div className="flex-grow">
        <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight">
          My Trips
        </h1>

        {loading ? (
          <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">Loading…</p>
        ) : (
          <>
            <TripSection
              title="Upcoming"
              trips={upcoming}
              emptyMessage="No upcoming trips."
            />
            <TripSection
              title="Current"
              trips={current}
              emptyMessage="No trips this week."
            />
            <TripSection
              title="Past"
              trips={past}
              emptyMessage="No past trips."
            />

            <Link
              href="/trips/new"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 border-4 border-black bg-brand-500 px-6 py-4 font-display text-lg font-bold uppercase tracking-widest text-white transition-all hover:bg-black dark:border-ink-dark/40 dark:hover:bg-surface-dark-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              Create trip
            </Link>
          </>
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
