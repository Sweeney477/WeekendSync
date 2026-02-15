"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TEMPLATES = [
  {
    id: "game-day-focus",
    name: "Game day focus",
    description: "Arrive, hit the game, head home. Minimal extras.",
    blocks: ["Fri: Travel / check-in", "Sat: Game day", "Sun: Brunch & leave"],
  },
  {
    id: "explore-and-game",
    name: "Explore and game",
    description: "One day exploring the city, one day at the ballpark.",
    blocks: ["Fri: Arrive, dinner", "Sat: Explore city", "Sun: Game and travel"],
  },
  {
    id: "chill-and-game",
    name: "Chill and game",
    description: "Low-key weekend with the game as the centerpiece.",
    blocks: ["Fri: Arrive, casual dinner", "Sat: Game", "Sun: Sleep in, leave"],
  },
];

export function ItinerarySetupClient({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(templateId: string) {
    setSelectedId(templateId);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedItineraryTemplateId: templateId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        setLoading(false);
        return;
      }
      router.push(`/trip/${tripId}/dashboard`);
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-ink-dark">
          Pick your weekend plan
        </h1>
        <p className="mt-1 font-sans text-sm text-slate-600 dark:text-muted-dark">
          We’ll drop this into your trip. You can edit it anytime.
        </p>
      </div>

      {error && (
        <p className="border-2 border-black bg-rose-50 p-3 font-medium text-rose-600 dark:border-ink-dark/40 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {TEMPLATES.map((t) => (
          <Card key={t.id} className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-black dark:text-ink-dark">
              {t.name}
            </h2>
            <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
              {t.description}
            </p>
            <ul className="list-inside list-disc font-sans text-sm text-black dark:text-ink-dark">
              {t.blocks.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <Button
              onClick={() => handleSelect(t.id)}
              disabled={loading}
              isLoading={loading && selectedId === t.id}
              variant="secondary"
              className="w-full"
            >
              Use this plan
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-center font-sans text-xs text-slate-500 dark:text-muted-dark">
        <Link href={`/trip/${tripId}/dashboard`} className="underline hover:no-underline">
          Skip and plan later
        </Link>
      </p>
    </div>
  );
}
