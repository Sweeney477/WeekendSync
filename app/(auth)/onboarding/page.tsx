"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tooltip } from "@/components/ui/Tooltip";
import { getFriendlyProfileError } from "@/lib/uxErrors";

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) {
        setIsCheckingSession(false);
        return;
      }
      const data = (await res.json()) as {
        user?: { id: string } | null;
        profile?: { display_name?: string; home_city?: string | null };
      };
      if (!data.user) {
        const redirect = new URL("/sign-in", window.location.origin);
        redirect.searchParams.set("next", `${window.location.pathname}${window.location.search}`);
        window.location.href = redirect.toString();
        return;
      }
      setDisplayName(data.profile?.display_name ?? "");
      setHomeCity(data.profile?.home_city ?? "");
      setIsCheckingSession(false);
    })();
  }, []);

  async function onSave() {
    setIsSaving(true);
    setError(null);
    try {
      const sp = new URLSearchParams(window.location.search);
      const inviteCode = sp.get("inviteCode");
      const next = sp.get("next");

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, homeCity: homeCity || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      if (inviteCode) {
        const joinRes = await fetch("/api/trips/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode }),
        });
        const joinJson = await joinRes.json().catch(() => null);
        if (joinRes.ok && joinJson?.tripId) {
          window.location.href = `/trip/${joinJson.tripId}/dashboard`;
          return;
        }
      }
      window.location.href = next || "/";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(getFriendlyProfileError(msg));
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingSession) {
    return <div className="mx-auto min-h-dvh w-full max-w-md px-4 py-8 text-sm text-slate-600 dark:text-muted-dark">Loading…</div>;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Quick setup</h1>
        <p className="text-sm text-slate-600 dark:text-muted-dark">Add your name so your group recognizes you. Home city is optional.</p>
      </header>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Input
            label={
              <div className="flex items-center gap-2">
                Your name
                <Tooltip content="This is how you'll appear to your friends in the trip.">
                  <button
                    type="button"
                    aria-label="Explain your name"
                    className="cursor-help rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                  >
                    ?
                  </button>
                </Tooltip>
              </div>
            }
            placeholder="e.g. Sam"
            hint="How your group will see you."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label={
              <div className="flex items-center gap-2">
                Home city (optional)
                <Tooltip content="We use this to suggest relevant events and travel options.">
                  <button
                    type="button"
                    aria-label="Explain home city"
                    className="cursor-help rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                  >
                    ?
                  </button>
                </Tooltip>
              </div>
            }
            placeholder="e.g. Chicago"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
          />
        </div>
        <Button onClick={onSave} isLoading={isSaving} disabled={!displayName}>
          Continue
        </Button>
        {error ? <p className="text-sm text-rose-700 dark:text-rose-400" role="alert">{error}</p> : null}
      </Card>
    </main>
  );
}

