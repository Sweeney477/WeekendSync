"use client";

import { usePathname } from "next/navigation";
import { Stepper, Step } from "@/components/ui/Stepper";

// Define a minimal Trip type interface for what we need, 
// to avoid importing massive schema types if not strictly necessary,
// or import from a shared types file if available.
// Based on previous file views, we know the structure.
interface TripProgressData {
    id: string;
    selectedCity: string | null;
    weekendType: string | null;
    preferencesJson: any; // Using any for flexibility with JSON field
}

export function SetupProgress({ trip }: { trip: TripProgressData }) {
    const pathname = usePathname();
    const weekendType = trip.weekendType;
    const isSports = weekendType === "sports";

    // Base steps that are always present
    const steps: Step[] = [
        {
            key: "city",
            label: "City",
            href: `/trip/${trip.id}/setup/city`,
            isComplete: !!trip.selectedCity,
            description: trip.selectedCity || undefined,
        },
        {
            key: "type",
            label: "Vibe",
            href: `/trip/${trip.id}/setup/weekend-type`,
            isComplete: !!trip.weekendType,
            description: weekendType ? (weekendType.charAt(0).toUpperCase() + weekendType.slice(1)) : undefined,
        },
    ];

    // Conditional steps for Sports flow
    if (isSports) {
        const sportsPrefs = trip.preferencesJson?.sports;
        const rulesComplete = !!sportsPrefs?.dateWindowStart || !!sportsPrefs?.teamQuery;

        steps.push({
            key: "details",
            label: "Sports",
            href: `/trip/${trip.id}/setup/sports-details`,
            isComplete: rulesComplete,
        });

        steps.push({
            key: "games",
            label: "Games",
            href: `/trip/${trip.id}/setup/games`,
            // Games are complete if we have selected weekends in preferences, 
            // but usually we leave setup after games. 
            // So this might usually be active or incomplete.
            isComplete: false,
        });
    }

    // Determine active key base on pathname
    let activeKey = "city";
    if (pathname.includes("/weekend-type")) activeKey = "type";
    else if (pathname.includes("/sports-details")) activeKey = "details";
    else if (pathname.includes("/games")) activeKey = "games";

    return (
        <div className="w-full border-b-2 border-black bg-slate-50 px-4 py-4 dark:border-ink-dark/40 dark:bg-surface-dark">
            <div className="mx-auto max-w-md">
                <Stepper steps={steps} activeKey={activeKey} />
            </div>
        </div>
    );
}
