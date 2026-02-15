"use client";

import { useState } from "react";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { Tooltip } from "@/components/ui/Tooltip";
import { TipCard } from "@/components/discovery/TipCard";
import { AvailabilityRow, type WeekendWithCounts } from "@/components/trip/AvailabilitySection";
import type { AvailabilityStatus } from "./hooks";
import { useVotingData } from "./hooks";
import { WeekendCard, DestinationCard } from "./components";

export function VotingClient({ tripId }: { tripId: string }) {
  const { weekends, destinations, myAvailability, setMyAvailability, loading, error: loadError } =
    useVotingData(tripId);

  const [weekendRankings, setWeekendRankings] = useState<string[]>([]);
  const [destinationRankings, setDestinationRankings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [availabilitySavingKey, setAvailabilitySavingKey] = useState<string | null>(null);

  const setAvailabilityStatus = async (weekendStart: string, status: AvailabilityStatus) => {
    const current = myAvailability[weekendStart] ?? "unset";
    if (current === status) return;

    setAvailabilitySavingKey(weekendStart);
    setMyAvailability((prev) => ({ ...prev, [weekendStart]: status }));

    try {
      const res = await fetch(`/api/trip/${tripId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekendStart, status }),
      });
      if (!res.ok) throw new Error("Failed to save availability");
    } catch (e) {
      setMyAvailability((prev) => ({ ...prev, [weekendStart]: current }));
    } finally {
      setAvailabilitySavingKey(null);
    }
  };

  const hasAnyAvailability = Object.values(myAvailability).some((s) => s !== "unset");
  const hasAnyVote = weekendRankings.length > 0 || destinationRankings.length > 0;
  const canSubmit = hasAnyAvailability || hasAnyVote;

  const toggleWeekend = (start: string) => {
    setWeekendRankings((prev) => {
      if (prev.includes(start)) return prev.filter((s) => s !== start);
      if (prev.length >= 3) return prev;
      return [...prev, start];
    });
  };

  const toggleDestination = (id: string) => {
    setDestinationRankings((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  async function onSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const wRankMap: Record<string, string> = {};
      weekendRankings.forEach((s, i) => { wRankMap[String(i + 1)] = s; });

      const dRankMap: Record<string, string> = {};
      destinationRankings.forEach((id, i) => { dRankMap[String(i + 1)] = id; });

      await Promise.all([
        fetch(`/api/trip/${tripId}/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType: "weekend", rankings: wRankMap }),
        }),
        fetch(`/api/trip/${tripId}/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType: "destination", rankings: dRankMap }),
        }),
      ]);
      window.location.href = `/trip/${tripId}/summary`;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save votes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading data: {loadError}</p>
      </div>
    );
  }

  const weekendsWithCounts = weekends.map((w) => ({
    ...w,
    counts: w.counts ?? { yes: 0, maybe: 0, no: 0, unset: 0, total: 0 },
  })) as WeekendWithCounts[];

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-10 px-4 pb-40">
        <TipCard
          id="voting_explanation"
          title="How Voting Works"
          description="First mark which weekends you can make. Then rank your top 3 dates and destinations. We use Ranked Choice Voting—your #1 pick gets the most points—to find the option that works for everyone."
        />

        <section className="flex flex-col gap-4" aria-labelledby="section-availability-heading">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 id="section-availability-heading" className="font-display text-2xl font-bold text-text dark:text-ink-dark">
                Section A: Mark Your Availability
              </h2>
              <Tooltip content="Which weekends can you make? We use this to find dates that work for everyone.">
                <button type="button" aria-label="Explain availability" className="cursor-help rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">?</button>
              </Tooltip>
            </div>
            <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
              Which weekends can you make? We&apos;ll use this to find dates that work for everyone.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {weekendsWithCounts.length === 0 ? (
              <p className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
                No dates yet — add dates in Plan first
              </p>
            ) : (
              weekendsWithCounts.map((w) => (
                <AvailabilityRow
                  key={w.weekend_start}
                  weekend={w}
                  currentStatus={myAvailability[w.weekend_start] ?? "unset"}
                  onStatusChange={(status) => setAvailabilityStatus(w.weekend_start, status)}
                  isSaving={availabilitySavingKey === w.weekend_start}
                  showCounts
                />
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="section-weekend-heading">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 id="section-weekend-heading" className="font-display text-2xl font-bold text-text dark:text-ink-dark">
                Section B: Vote for Weekend
              </h2>
              <Tooltip content="Rank your top 3 preferred weekends. #1 is your favorite.">
                <button type="button" aria-label="Explain weekend ranking" className="cursor-help rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">?</button>
              </Tooltip>
            </div>
            <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
              Select your top 3 choices by priority
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {weekends.map((w) => (
              <WeekendCard
                key={w.weekend_start}
                weekend={w}
                rank={weekendRankings.indexOf(w.weekend_start) + 1}
                isSelected={weekendRankings.includes(w.weekend_start)}
                onToggle={() => toggleWeekend(w.weekend_start)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="section-destination-heading">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 id="section-destination-heading" className="font-display text-2xl font-bold text-text dark:text-ink-dark">
                Section C: Vote for Destination
              </h2>
              <Tooltip content="Rank your top 3 cities. We'll combine this with weather data.">
                <button type="button" aria-label="Explain city ranking" className="cursor-help rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">?</button>
              </Tooltip>
            </div>
            <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
              Select your top 3 favorite locations
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {destinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                rank={destinationRankings.indexOf(d.id) + 1}
                isSelected={destinationRankings.includes(d.id)}
                onToggle={() => toggleDestination(d.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md dark:bg-zinc-950/90 border-t border-slate-100 dark:border-zinc-800">
        {saveError && <p className="mb-2 text-center text-sm text-red-500">{saveError}</p>}
        <button
          onClick={onSave}
          disabled={saving || !canSubmit}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl font-display font-medium text-lg tracking-wide text-white shadow-lg transition-all 
            ${saving
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-cta hover:bg-blue-600 hover:shadow-xl active:bg-blue-700 active:scale-[0.99]"
            }`}
        >
          {saving ? "Submitting..." : (
            <>
              Submit Vote
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </StickyFooter>
    </div>
  );
}
