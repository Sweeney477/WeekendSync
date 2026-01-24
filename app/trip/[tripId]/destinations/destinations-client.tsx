/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { StickyFooter } from "@/components/ui/StickyFooter";

type Destination = {
  id: string;
  city_name: string;
  country_code: string | null;
  rationale_tags: string[];
  rank_score: number;
};

const RECOMMENDED = [
  {
    city_name: "Lisbon",
    country_code: "Portugal",
    rationale_tags: ["Fair Travel", "Major Airport"],
    flight_time: "3h Flight",
    image: "https://images.unsplash.com/photo-1585211848332-6718cd94a64d?q=80&w=800&auto=format&fit=crop",
  },
  {
    city_name: "Berlin",
    country_code: "Germany",
    rationale_tags: ["Nightlife", "History"],
    flight_time: "1.5h Flight",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop",
  },
  {
    city_name: "Prague",
    country_code: "Czechia",
    rationale_tags: ["Affordable", "Castle"],
    flight_time: "5h Train",
    image: "https://images.unsplash.com/photo-1519677100203-ad03822ef294?q=80&w=800&auto=format&fit=crop",
  },
];

export function DestinationsClient({ tripId }: { tripId: string }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [cityName, setCityName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/trip/${tripId}/destinations`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error ?? "Failed to load destinations");
    setDestinations(json.destinations as Destination[]);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      await refresh();
      setLoading(false);
    })().catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function onAdd() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/trip/${tripId}/destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to add destination");
      setCityName("");
      setIsManualOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = destinations.length;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-8 px-4 pb-48">
        <div className="flex w-full items-center justify-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-12 rounded-full bg-cyan-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">
            Recommended for your group
          </h2>

          <div className="flex flex-col gap-8">
            {RECOMMENDED.map((rec) => {
              const isSelected = destinations.some((d) => d.city_name === rec.city_name);
              return (
                <div key={rec.city_name} className="flex flex-col gap-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-slate-100 shadow-xl">
                    <Image src={rec.image} alt={rec.city_name} fill className="object-cover" />
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-slate-900 shadow-sm backdrop-blur-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-cyan-500"
                      >
                        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                      </svg>
                      {rec.flight_time}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {rec.city_name}, {rec.country_code}
                      </h3>
                      <div className="mt-2 flex gap-2">
                        {rec.rationale_tags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-[10px] font-bold text-cyan-600 uppercase"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (isSelected) return;
                        setCityName(rec.city_name);
                        // Trigger add logic
                        const res = await fetch(`/api/trip/${tripId}/destinations`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ cityName: rec.city_name }),
                        });
                        if (res.ok) {
                          setCityName("");
                          await refresh();
                        }
                      }}
                      className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-[0.98] ${isSelected
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                        : "bg-cyan-400 text-white shadow-lg shadow-cyan-100"
                        }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {isSelected ? (
                            <polyline points="20 6 9 17 4 12" />
                          ) : (
                            <>
                              <line x1="12" x2="12" y1="5" y2="19" />
                              <line x1="5" x2="19" y1="12" y2="12" />
                            </>
                          )}
                        </svg>
                      </div>
                      {isSelected ? "Selected" : "Select as candidate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <button
            onClick={() => setIsManualOpen(!isManualOpen)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-900">Add destination manually</span>
            </div>
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
              className={`text-slate-400 transition-transform ${isManualOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isManualOpen && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <input
                type="text"
                placeholder="City Name"
                className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium focus:ring-2 focus:ring-cyan-400"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              />
              <button
                onClick={onAdd}
                disabled={!cityName || saving}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 font-bold text-white transition-all active:scale-[0.98]"
              >
                {saving ? "Adding..." : "Add to Candidates"}
              </button>
            </div>
          )}
        </section>
      </div>

      <StickyFooter className="bg-white/90 backdrop-blur-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">{selectedCount} candidates selected</span>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-400 text-[10px] font-bold text-white uppercase"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => (window.location.href = `/trip/${tripId}/voting`)}
            disabled={selectedCount < 2}
            className={`flex h-16 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${selectedCount >= 2 ? "bg-cyan-400 shadow-cyan-100" : "bg-slate-300 shadow-none cursor-not-allowed"
              }`}
          >
            Continue to Voting
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" x2="19" y1="12" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </StickyFooter>
    </div>
  );
}

