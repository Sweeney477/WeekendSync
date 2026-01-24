"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Stepper, type Step } from "@/components/ui/Stepper";

interface TripHeaderWithNavProps {
  tripId: string;
  tripName: string;
}

export function TripHeaderWithNav({ tripId, tripName }: TripHeaderWithNavProps) {
  const router = useRouter();
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

  const activeStep = steps.find((s) => s.key === activeKey);
  const subtitle = activeStep?.label;

  return (
    <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md">
      <header className="flex w-full items-center justify-between px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-lg font-bold text-slate-900">{tripName}</h1>
          {subtitle && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
            aria-label="Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </header>

      <nav className="px-4 pb-3">
        <Stepper steps={steps} activeKey={activeKey} />
      </nav>
    </div>
  );
}
