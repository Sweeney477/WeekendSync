"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, homeCity: homeCity || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingSession) {
    return <div className="mx-auto min-h-dvh w-full max-w-md px-4 py-8 text-sm text-slate-600">Loading…</div>;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 pb-24">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-slate-600">Update your personal info for this WeekendSync account.</p>
        </div>
        <Link href="/" className="text-sm font-bold text-slate-400 underline decoration-slate-200">
          Home
        </Link>
      </header>

      <Card className="flex flex-col gap-3">
        <Input label="Your name" placeholder="e.g. Sam" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Input label="Home city (optional)" placeholder="e.g. Chicago" value={homeCity} onChange={(e) => setHomeCity(e.target.value)} />
        <Button onClick={onSave} isLoading={isSaving} disabled={!displayName}>
          Save changes
        </Button>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      </Card>
    </main>
  );
}
