import { useState, useEffect } from "react";

export type WeekendCounts = { yes: number; maybe: number; no: number; unset: number; total: number };
export type Weekend = {
    weekend_start: string;
    weekend_end: string;
    score: number;
    counts?: WeekendCounts;
};
export type Destination = { id: string; city_name: string; country_code: string | null; rank_score: number; rationale_tags: string[] };
export type AvailabilityStatus = "yes" | "maybe" | "no" | "unset";

export function useVotingData(tripId: string) {
    const [weekends, setWeekends] = useState<Weekend[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [myAvailability, setMyAvailability] = useState<Record<string, AvailabilityStatus>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [wRes, dRes, aRes] = await Promise.all([
                    fetch(`/api/trip/${tripId}/weekends`, { cache: "no-store" }),
                    fetch(`/api/trip/${tripId}/destinations`, { cache: "no-store" }),
                    fetch(`/api/trip/${tripId}/availability`, { cache: "no-store" }),
                ]);
                const wJson = await wRes.json().catch(() => null);
                const dJson = await dRes.json().catch(() => null);
                const aJson = await aRes.json().catch(() => null);

                if (!mounted) return;

                if (!wRes.ok) throw new Error(wJson?.error ?? "Failed to load weekends");
                if (!dRes.ok) throw new Error(dJson?.error ?? "Failed to load destinations");

                setWeekends(wJson.weekends ?? []);
                setDestinations(dJson.destinations ?? []);

                if (aRes.ok) {
                    const map: Record<string, AvailabilityStatus> = {};
                    for (const r of aJson.availability ?? []) {
                        map[r.weekendStart] = r.status as AvailabilityStatus;
                    }
                    setMyAvailability(map);
                }
            } catch (e) {
                if (mounted) {
                    setError(e instanceof Error ? e.message : "Failed to load data");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [tripId]);

    return { weekends, destinations, myAvailability, setMyAvailability, loading, error };
}
