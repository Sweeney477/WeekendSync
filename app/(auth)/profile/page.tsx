"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getFriendlyProfileError } from "@/lib/uxErrors";

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
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-black dark:text-ink-dark">Profile</h1>
          <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">Update your personal info for this WeekendSync account.</p>
        </div>
        <Link href="/" className="font-display text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-black hover:underline dark:hover:text-ink-dark">
          Home
        </Link>
      </header>

      <Card className="flex flex-col gap-4">
        <ThemeToggle />

        <div className="flex flex-col gap-2">
          <label className="font-display text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-muted-dark">Your name</label>
          <input
            type="text"
            placeholder="e.g. Sam"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border-2 border-black bg-transparent p-3 font-display text-lg font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:bg-poster-yellow focus:outline-none dark:border-ink-dark/40 dark:text-ink-dark dark:placeholder:text-muted-dark dark:focus:bg-surface-dark-2"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-display text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-muted-dark">Home city (optional)</label>
          <input
            type="text"
            placeholder="e.g. Chicago"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
            className="w-full border-2 border-black bg-transparent p-3 font-display text-lg font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:bg-poster-yellow focus:outline-none dark:border-ink-dark/40 dark:text-ink-dark dark:placeholder:text-muted-dark dark:focus:bg-surface-dark-2"
          />
        </div>

        <button
          onClick={onSave}
          disabled={!displayName || isSaving}
          className="mt-2 w-full border-2 border-black bg-brand-500 p-4 font-display text-lg font-bold uppercase tracking-widest text-white transition-all hover:bg-black hover:text-white hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 dark:border-ink-dark/40 dark:hover:shadow-[4px_4px_0px_0px_rgba(232,228,223,0.15)]"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>

        {error ? <p className="font-display text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{error}</p> : null}
        {success ? <p className="font-display text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{success}</p> : null}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-wider text-black dark:text-ink-dark">Tips & Tricks</h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-poster-yellow font-bold text-black">1</div>
            <div>
              <h4 className="font-bold text-black dark:text-ink-dark">Invite Everyone</h4>
              <p className="text-sm text-slate-600 dark:text-muted-dark">Share your trip code to get the whole squad voting.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-poster-pink font-bold text-black">2</div>
            <div>
              <h4 className="font-bold text-black dark:text-ink-dark">Ranked Voting</h4>
              <p className="text-sm text-slate-600 dark:text-muted-dark">Don&apos;t just pick one! Rank your choices to find the best compromise.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-poster-green font-bold text-black">3</div>
            <div>
              <h4 className="font-bold text-black dark:text-ink-dark">Works Offline</h4>
              <p className="text-sm text-slate-600 dark:text-muted-dark">Going off the grid? You can still view plans and make edits offline.</p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
