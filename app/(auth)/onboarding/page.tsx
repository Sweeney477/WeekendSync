"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
      setError(e instanceof Error ? e.message : "Failed to save profile");
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
        <Input label="Your name" placeholder="e.g. Sam" hint="How your group will see you." value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Input label="Home city (optional)" placeholder="e.g. Chicago" value={homeCity} onChange={(e) => setHomeCity(e.target.value)} />
        <Button onClick={onSave} isLoading={isSaving} disabled={!displayName}>
          Continue
        </Button>
        {error ? <p className="text-sm text-rose-700 dark:text-rose-400" role="alert">{error}</p> : null}
      </Card>
    </main>
  );
}

