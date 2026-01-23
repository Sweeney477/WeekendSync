"use client";

import { usePathname } from "next/navigation";
import { Stepper, type Step } from "@/components/ui/Stepper";

export function TripNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const steps: Step[] = [
    { key: "plan", label: "Plan", href: `/trip/${tripId}/plan` },
    { key: "dashboard", label: "Dashboard", href: `/trip/${tripId}/dashboard` },
    { key: "availability", label: "Availability", href: `/trip/${tripId}/availability` },
    { key: "weekends", label: "Weekends", href: `/trip/${tripId}/weekends` },
    { key: "destinations", label: "Destinations", href: `/trip/${tripId}/destinations` },
    { key: "voting", label: "Voting", href: `/trip/${tripId}/voting` },
    { key: "events", label: "Events", href: `/trip/${tripId}/events` },
    { key: "summary", label: "Summary", href: `/trip/${tripId}/summary` },
  ];

  const activeKey =
    steps.find((s) => pathname?.includes(`/trip/${tripId}/${s.key}`))?.key ??
    (pathname?.endsWith(`/trip/${tripId}`) ? "plan" : "plan");

  return <Stepper steps={steps} activeKey={activeKey} />;
}

