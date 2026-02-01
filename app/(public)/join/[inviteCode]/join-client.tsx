"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getFriendlyJoinError } from "@/lib/uxErrors";

export function JoinClient({ inviteCode }: { inviteCode: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Check if user is signed in
        const meRes = await fetch("/api/me", { cache: "no-store" });
        const meJson = await meRes.json();
        
        if (!meJson.user) {
          setLoading(false);
          return; // Not signed in, show sign-in button
        }

        // User is signed in, check if they need onboarding
        if (!meJson.profile?.display_name) {
          window.location.href = `/onboarding?inviteCode=${encodeURIComponent(inviteCode)}`;
          return;
        }

        // User is signed in and onboarded, try to join
        const joinRes = await fetch("/api/trips/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode }),
        });

        const joinJson = await joinRes.json();
        if (!joinRes.ok) {
          const msg = joinJson?.error ?? "";
          setError(getFriendlyJoinError(msg));
          setLoading(false);
          return;
        }

        // Success - redirect to trip dashboard
        if (joinJson.tripId) {
          window.location.href = `/trip/${joinJson.tripId}/dashboard`;
        } else {
          setError("Something went wrong. Try again or go to Home.");
          setLoading(false);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Try again or go to Home.");
        setLoading(false);
      }
    })();
  }, [inviteCode]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 py-8 pb-24">
      <h1 className="text-2xl font-semibold">Join trip</h1>
      <p className="text-sm text-slate-600 dark:text-muted-dark">
        Code: <span className="font-mono font-medium">{inviteCode}</span>
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8" aria-live="polite">
          <p className="text-sm text-slate-600 dark:text-muted-dark">Joining trip…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
            {error}
          </div>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 dark:hover:bg-brand-500"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <a
          href={`/sign-in?inviteCode=${encodeURIComponent(inviteCode)}`}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 dark:hover:bg-brand-500"
        >
          Sign in to join
        </a>
      )}
    </main>
  );
}
