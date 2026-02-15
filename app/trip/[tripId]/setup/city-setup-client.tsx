"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CitySetupClient({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!city.trim()) {
      setError("Please enter a city.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCity: { city: city.trim() } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save city.");
        setLoading(false);
        return;
      }
      router.push(`/trip/${tripId}/setup/weekend-type`);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-ink-dark">
          Where to?
        </h1>
        <p className="mt-1 font-sans text-sm text-slate-600 dark:text-muted-dark">
          Pick the city for your weekend.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="city"
                className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-ink-dark"
              >
                City
              </label>
              <div className="group relative">
                <div className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-slate-400">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-black px-3 py-2 text-center font-sans text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800">
                  This will be the anchor for your weekend. You can change it later.
                  <div className="absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-black dark:bg-zinc-800"></div>
                </div>
              </div>
            </div>
            <input
              id="city"
              type="text"
              placeholder="e.g. Chicago, Denver"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-14 w-full border-2 border-black bg-transparent px-4 font-sans text-lg font-bold focus:border-primary focus:ring-0 dark:border-ink-dark/40 dark:text-ink-dark dark:focus:border-poster-yellow"
              maxLength={120}
            />
          </div>
          {error && (
            <p className="border-2 border-black bg-rose-50 p-3 font-medium text-rose-600 dark:border-ink-dark/40 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading || !city.trim()} isLoading={loading} className="w-full">
            Continue
          </Button>
        </form>
      </Card>

      <p className="text-center font-sans text-xs text-slate-500 dark:text-muted-dark">
        <Link href={`/trip/${tripId}/dashboard`} className="underline hover:no-underline">
          Skip setup and go to dashboard
        </Link>
      </p>
    </div >
  );
}
