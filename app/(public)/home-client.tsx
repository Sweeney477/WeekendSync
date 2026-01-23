"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type MeResponse = {
  user: { id: string; email?: string | null } | null;
  profile: { id: string; display_name: string; home_city: string | null } | null;
};

type MyTripsResponse = {
  trips: Array<{ id: string; name: string; inviteCode: string; inviteLink: string; status: string; role: string }>;
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
      setActionError(e instanceof Error ? e.message : "Failed to create trip");
      setLoading(false);
    }
  }

  async function onJoinTrip() {
    setActionError(null);
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
      setActionError(e instanceof Error ? e.message : "Failed to join trip");
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-8 bg-slate-50 px-6 py-12 pb-24 font-sans text-slate-900">
      {createdTrip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <Card className="flex w-full flex-col items-center gap-6 rounded-[40px] border-none bg-white p-10 text-center shadow-2xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-cyan-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-slate-900">Trip Created!</h2>
              <p className="text-sm leading-relaxed text-slate-500">
                Share this unique link with your group. No app download required for them to vote.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center justify-between rounded-2xl bg-cyan-50/50 p-4 border border-cyan-100">
                <span className="truncate text-sm font-medium text-cyan-700">
                  weekendsync.app/j/{createdTrip.inviteCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Copied!");
                  }}
                  className="rounded-lg bg-cyan-100 px-3 py-1.5 text-[10px] font-bold text-cyan-600 uppercase"
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
                    alert("Link copied!");
                  });
                }}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-bold text-white shadow-lg shadow-cyan-100 active:scale-[0.98]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </svg>
                Share Invite
              </button>

              <Link
                href={`/trip/${createdTrip.id}/plan`}
                className="text-sm font-bold text-slate-400 underline decoration-slate-200"
              >
                Go to Trip Plan
              </Link>
            </div>
          </Card>
        </div>
      )}

      <header className="flex w-full items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
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
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">WeekendSync</h1>
      </header>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-slate-200 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=800&auto=format&fit=crop"
          alt="Friends having fun"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
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
        </div>
      </div>

      {isAuthed && planningTrips.length ? (
        <Card className="flex w-full flex-col gap-4 rounded-[32px] border-none p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-slate-900">Trips you&apos;re planning</h2>
              <p className="text-sm text-slate-500">Jump back into the trips you&apos;re organizing.</p>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-[10px] font-bold uppercase text-brand-600">
              Organizer
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {planningTrips.map((t) => (
              <Link
                key={t.id}
                href={`/trip/${t.id}/plan`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                      {t.status === "locked" ? "Locked" : "Planning"}
                    </span>
                    <span>Organizer</span>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="flex w-full flex-col gap-6 rounded-[32px] border-none p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900">Join a Trip</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Enter the unique code shared by your friends to sync up and start planning.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-900">Trip Code</label>
            <div className="relative">
              <input
                type="text"
                placeholder="E.G. WKND24"
                className="h-16 w-full rounded-2xl border-none bg-slate-100 px-6 text-center text-lg font-bold tracking-widest text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <Button
            className="h-14 w-full rounded-2xl bg-brand-400 text-lg font-bold shadow-lg shadow-brand-200 transition-all hover:bg-brand-500 active:scale-[0.98]"
            onClick={onJoinTrip}
            disabled={!inviteCode || loading}
          >
            Join Trip
          </Button>
        </div>
      </Card>

      <div className="flex w-full items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-bold text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

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
        className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border-2 border-brand-400 bg-white text-lg font-bold text-brand-400 transition-all hover:bg-brand-50 active:scale-[0.98]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-400 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </div>
        Create New Trip
      </button>

      {isAuthed && myTrips?.trips?.length ? (
        <div className="flex w-full flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Trips</h2>
          <div className="flex flex-col gap-3">
            {myTrips.trips.map((t) => (
              <Link
                key={t.id}
                href={`/trip/${t.id}/plan`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <span className="text-xs text-slate-500 uppercase">{t.role}</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          <button onClick={onSignOut} className="text-sm font-bold text-slate-400 underline decoration-slate-200">
            Sign Out
          </button>
        </div>
      ) : null}

      <footer className="mt-auto flex flex-col items-center gap-1 text-center">
        <p className="max-w-[280px] text-xs leading-relaxed text-slate-400">
          Your plans are private and secure. By joining, you agree to our{" "}
          <Link href="/privacy" className="text-brand-400 underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-brand-400 underline">
            Terms of Service
          </Link>
          .
        </p>
      </footer>

      {actionError ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-rose-50 px-6 py-2 text-sm font-bold text-rose-600 shadow-lg">
          {actionError}
        </div>
      ) : null}
    </main>
  );
}

