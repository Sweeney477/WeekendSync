"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * Single next-step CTA for the trip dashboard (activation path).
 * Priority: Invite → Mark Availability → Pick Date → Choose Destination → Logistics → Itinerary → Trip is Ready.
 */
type NextStepProps = {
    tripId: string;
    isOrganizer: boolean;
    memberCount: number;
    hasSubmittedAvailability: boolean;
    datesFinalized: boolean;
    destinationFinalized: boolean;
    hasLogistics: boolean;
    hasItinerary: boolean;
    className?: string;
};

export function NextStepsCard({
    tripId,
    isOrganizer,
    memberCount,
    hasSubmittedAvailability,
    datesFinalized,
    destinationFinalized,
    hasLogistics,
    hasItinerary,
    className,
}: NextStepProps) {
    // Confetti triggering logic
    useEffect(() => {
        // If we just landed here and something big is done, maybe trigger?
        // For now, let's keep it simple: just a utility for future manual triggers
        // or we could trigger on mount if a specific query param is present (e.g. ?celebrate=true)
        const params = new URLSearchParams(window.location.search);
        if (params.get("celebrate") === "true") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#FCD34D", "#3B82F6", "#F43F5E"], // Brand colors
            });
            // Remove param without refresh
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    // Determine the highest priority next step
    let step = {
        title: "Invite Your Squad",
        description: "Trips are better with friends. Send out that invite code!",
        href: `/trip/${tripId}/dashboard`, // Focus on invite button
        cta: "Invite Friends",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        ),
    };

    if (memberCount >= 2) {
        if (!hasSubmittedAvailability) {
            step = {
                title: "Mark Availability",
                description: "Let the group know when you can make it.",
                href: `/trip/${tripId}/availability`,
                cta: "Mark Dates",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                ),
            };
        } else if (!datesFinalized) {
            step = {
                title: "Pick the Date",
                description: "Review everyone's availability and choose the winning weekend.",
                href: `/trip/${tripId}/weekends`,
                cta: isOrganizer ? "Finalize Dates" : "View Options", // Or "Vote" if we had voting logic passed
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M10 14h4" /></svg>
                ),
            };
        } else if (!destinationFinalized) { // Assuming city setup counts as destination finalized or we have separate logic
            // If city is set in trip, this might not trigger if we don't pass explicit check,
            // but let's assume 'destinationFinalized' covers 'City' or 'Destination Voting'
            step = {
                title: "Choose Destination",
                description: "Where are we going? Time to decide on a city.",
                href: `/trip/${tripId}/setup/city`, // Or voting page if multiple options
                cta: "Pick City",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                ),
            }
        } else if (!hasLogistics) {
            step = {
                title: "Book Logistics",
                description: "Dates and city are set! Now add flights or hotels.",
                href: `/trip/${tripId}/plan`, // Direct them to plan/logistics
                cta: "Add Logistics",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                ),
            };
        } else if (!hasItinerary) {
            step = {
                title: "Build Itinerary",
                description: "Start adding events, reservations, and activities.",
                href: `/trip/${tripId}/plan`,
                cta: "Add Activities",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                ),
            };
        } else {
            // Everything major is done!
            step = {
                title: "Trip is Ready!",
                description: "All set. Get ready for an amazing weekend!",
                href: `/trip/${tripId}/plan`, // Just go to plan
                cta: "View Itinerary",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                ),
            };
        }
    }

    // If member count < 2 (just created), we override to "Invite"
    // handled by first if block logic implicitly if other conditions not met
    // But wait, step is initialized to Invite.
    // The first if (memberCount >= 2) guards the rest.
    // So if memberCount < 2, it stays as Invite.

    return (
        <div className={cn("relative flex flex-col justify-end border-4 border-black bg-poster-blue p-6 shadow-[8px_8px_0px_0px_#000] dark:border-ink-dark/40 dark:shadow-[8px_8px_0px_0px_rgba(232,228,223,0.15)]", className)}>
            <div className="flex flex-col gap-2">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-white">
                    Next Step:<br />
                    {step.title}
                </h2>
                <p className="font-sans text-sm font-medium text-white/90">
                    {step.description}
                </p>
            </div>
            <Link
                href={step.href}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 border-2 border-black bg-poster-yellow font-display text-lg font-bold uppercase tracking-widest text-black transition-all hover:bg-white hover:text-black active:translate-y-1"
            >
                {step.cta}
                {step.icon}
            </Link>
        </div>
    );
}
