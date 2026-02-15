"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFriendlyCreateError, getFriendlyJoinError } from "@/lib/uxErrors";
import { toast } from "sonner";

type MeResponse = {
  user: { id: string; email?: string | null } | null;
  profile: { id: string; display_name: string; home_city: string | null } | null;
};

type MyTripsResponse = {
  trips: Array<{ id: string; name: string; inviteCode: string; inviteLink: string; status: string; role: string; selectedWeekendStart: string | null }>;
};

export function HomeClient() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [myTrips, setMyTrips] = useState<MyTripsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [tripName, setTripName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const [createdTrip, setCreatedTrip] = useState<{ id: string; inviteCode: string } | null>(null);

  const isAuthed = !!me?.user;
  const needsOnboarding = isAuthed && !me?.profile?.display_name;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [meRes, tripsRes] = await Promise.all([
          fetch("/api/me", { cache: "no-store" }),
          fetch("/api/my-trips", { cache: "no-store" })
        ]);

        const meJson = (await meRes.json()) as MeResponse;
        setMe(meJson);

        if (tripsRes.ok) {
          const tripsJson = (await tripsRes.json()) as MyTripsResponse;
          setMyTrips(tripsJson);
        } else {
          console.error("Failed to fetch trips:", await tripsRes.text());
          setMyTrips({ trips: [] });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const header = useMemo(() => {
    if (loading) return "Loading…";
    if (!isAuthed) return "Plan the meetup weekend your group can actually make.";
    return `Welcome${me?.profile?.display_name ? `, ${me.profile.display_name}` : ""}.`;
  }, [isAuthed, loading, me?.profile?.display_name]);

  const planningTrips = useMemo(
    () => myTrips?.trips?.filter((t) => t.role === "organizer") ?? [],
    [myTrips?.trips]
  );

  async function onCreateTrip(name?: string) {
    setActionError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || tripName, lookaheadWeeks: 12 }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        // Handle onboarding requirement (409)
        if (res.status === 409) {
          router.push("/onboarding");
          return;
        }
        throw new Error(json?.error ?? "Failed to create trip");
      }

      // Verify we have the trip data
      if (!json?.trip?.id) {
        throw new Error("Invalid response from server");
      }

      // Automatically redirect to the trip plan page
      router.push(`/trip/${json.trip.id}/plan`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setActionError(getFriendlyCreateError(msg));
      setLoading(false);
    }
  }

  async function onJoinTrip() {
    setActionError(null);

    // Guest or incomplete profile: send to sign-in or onboarding so they can join after auth
    if (!isAuthed) {
      router.push(`/sign-in?inviteCode=${encodeURIComponent(inviteCode)}`);
      return;
    }
    if (needsOnboarding) {
      router.push(`/onboarding?inviteCode=${encodeURIComponent(inviteCode)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trips/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error ?? "Failed to join trip");
      }

      // Verify we have the tripId
      if (!json?.tripId) {
        throw new Error("Invalid response from server");
      }

      router.push(`/trip/${json.tripId}/plan`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setActionError(getFriendlyJoinError(msg));
      setLoading(false);
    }
  }

  async function onSignOut() {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const shareUrl = createdTrip ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${createdTrip.inviteCode}` : "";

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col p-6">
      {createdTrip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="flex w-full flex-col gap-6 border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000] dark:border-ink-dark/40 dark:bg-surface-dark dark:shadow-[8px_8px_0px_0px_rgba(232,228,223,0.15)]">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tighter">Trip Created!</h2>
              <p className="font-sans text-sm font-medium">
                Share this unique link with your group.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center justify-between border-2 border-black bg-background-light p-4 dark:border-ink-dark/40 dark:bg-surface-dark-2">
                <span className="truncate font-sans text-sm font-bold tracking-widest text-black dark:text-ink-dark">
                  weekendsync.app/j/{createdTrip.inviteCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied");
                  }}
                  className="bg-poster-yellow px-2 py-1 font-display text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white"
                  aria-label="Copy invite link"
                >
                  Copy
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.share?.({
                    title: "Join my trip on WeekendSync",
                    url: shareUrl,
                  }).catch(() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied");
                  });
                }}
                className="flex w-full items-center justify-center gap-2 bg-poster-blue py-4 font-display text-xl font-bold uppercase tracking-widest text-white transition-all hover:bg-black active:translate-y-1"
              >
                Share Invite
              </button>

              <Link
                href={`/trip/${createdTrip.id}/plan`}
                className="text-center font-display text-sm font-bold uppercase tracking-widest underline hover:text-primary"
              >
                Go to Trip Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      <header className="mb-16 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-black dark:bg-ink-dark">
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
              className="text-white dark:text-background-dark"
            >
              <path d="M3 2v6h6V2z" />
              <path d="M15 2v6h6V2z" />
              <path d="M3 16v6h6v-6z" />
              <path d="M15 16v6h6v-6z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold leading-none tracking-tighter uppercase">
            Weekend<br /><span className="text-primary">Sync</span>
          </h1>
        </div>
      </header>

      <div className="relative mb-12">
        <div className="flex aspect-square flex-col justify-between border-4 border-black bg-white p-4 dark:border-ink-dark/40 dark:bg-surface-dark">
          <div className="flex items-start justify-between">
            <span className="font-display text-6xl font-bold leading-none">01</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="border-t-4 border-black pt-4 dark:border-ink-dark/40">
            <p className="font-display text-xl font-bold uppercase tracking-widest">
              {isAuthed ? `Welcome back, ${me?.profile?.display_name?.split(' ')[0] ?? 'Friend'}` : "Find Your People"}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 -z-10 h-full w-full bg-poster-blue"></div>
      </div>

      <div className="flex-grow">
        {isAuthed && planningTrips.length > 0 ? (
          <div className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight">Your Trips</h2>
            <div className="flex flex-col gap-3">
              {planningTrips.map((t) => (
                <Link
                  key={t.id}
                  href={`/trip/${t.id}/plan`}
                  className="group flex items-center justify-between border-2 border-black bg-white p-4 transition-all hover:bg-poster-yellow dark:border-ink-dark/40 dark:bg-surface-dark dark:hover:bg-poster-yellow dark:hover:text-black"
                >
                  <div className="flex flex-col">
                    <span className="font-display font-bold uppercase tracking-wider">{t.name}</span>
                    <span className="font-sans text-xs font-bold uppercase opacity-60">Organizer</span>
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
              ))}

              {myTrips?.trips?.filter(t => t.role !== "organizer").map((t) => (
                <Link
                  key={t.id}
                  href={`/trip/${t.id}/plan`}
                  className="group flex items-center justify-between border-2 border-black bg-slate-50 p-4 transition-all hover:bg-poster-green hover:text-white dark:border-ink-dark/40 dark:bg-surface-dark-2"
                >
                  <div className="flex flex-col">
                    <span className="font-display font-bold uppercase tracking-wider">{t.name}</span>
                    <span className="font-sans text-xs font-bold uppercase opacity-60">Participant</span>
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
              ))}
            </div>
          </div>
        ) : isAuthed && !loading ? (
          <div className="mb-12">
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              }
              title="No Trips Yet"
              description="Create a trip to coordinate availability, vote on dates, and plan your weekend with friends."
              primaryAction={{
                label: "Create Your First Trip",
                onClick: () => {
                  if (needsOnboarding) {
                    router.push("/onboarding?next=/trips/new");
                  } else {
                    router.push("/trips/new");
                  }
                },
              }}
              secondaryAction={{
                label: "Learn How It Works",
                href: "/help",
              }}
            />
          </div>
        ) : null}

        <h2 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight">Join a Trip</h2>
        <p className="mb-8 max-w-[80%] font-medium leading-snug opacity-80">
          Enter the code your friend shared to join their trip.
        </p>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-display text-xs font-bold uppercase tracking-widest" htmlFor="trip-code">
              Trip code
            </label>
            <input
              id="trip-code"
              type="text"
              placeholder="e.g. WKND24"
              aria-describedby="trip-code-hint"
              className="w-full border-4 border-black bg-transparent p-4 font-display text-2xl font-bold uppercase tracking-widest placeholder:text-zinc-400 focus:border-primary focus:ring-0 dark:border-ink-dark/40 dark:text-ink-dark dark:placeholder:text-muted-dark dark:focus:border-poster-yellow"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            />
            <p id="trip-code-hint" className="mt-1.5 font-sans text-xs text-slate-600 dark:text-muted-dark">8–12 letters and numbers</p>
          </div>
          <button
            onClick={onJoinTrip}
            disabled={!inviteCode || loading}
            className="w-full border-4 border-black bg-brand-500 px-6 py-5 font-display text-xl font-bold uppercase tracking-widest text-white transition-all hover:bg-black hover:text-white active:translate-y-1 disabled:opacity-50 dark:border-ink-dark/40 dark:hover:bg-surface-dark-2"
            aria-busy={loading}
          >
            {loading ? "Joining…" : "Join trip"}
          </button>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-4">
        <div className="h-1 flex-grow bg-black dark:bg-ink-dark/40"></div>
        <span className="font-display text-sm font-bold tracking-widest">OR</span>
        <div className="h-1 flex-grow bg-black dark:bg-ink-dark/40"></div>
      </div>

      <div className="mb-8 mt-8">
        <button
          onClick={() => {
            if (!isAuthed) {
              router.push("/sign-in?next=/trips/new");
            } else if (needsOnboarding) {
              router.push("/onboarding?next=/trips/new");
            } else {
              router.push("/trips/new");
            }
          }}
          className="flex w-full items-center justify-center gap-3 border-4 border-black p-4 font-display font-bold uppercase tracking-widest hover:bg-poster-yellow hover:text-black transition-colors dark:border-ink-dark/40 dark:text-ink-dark"
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
          Create New Trip
        </button>
      </div>

      <div className="fixed top-0 left-0 h-full w-2 flex flex-col">
        <div className="flex-1 bg-poster-orange"></div>
        <div className="flex-1 bg-poster-yellow"></div>
        <div className="flex-1 bg-poster-green"></div>
        <div className="flex-1 bg-poster-blue"></div>
      </div>

      {actionError ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 border-2 border-black bg-rose-50 px-6 py-2 font-display text-sm font-bold uppercase tracking-wider text-rose-600 shadow-[4px_4px_0px_0px_#000] dark:border-ink-dark/40 dark:bg-rose-900/20 dark:text-rose-400 dark:shadow-[4px_4px_0px_0px_rgba(232,228,223,0.15)]" role="alert">
          {actionError}
        </div>
      ) : null}
    </main>
  );
}

