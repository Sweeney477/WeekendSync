"use client";

import { type ReactNode } from "react";
import { format, parseISO } from "date-fns";

export type WeekendWithCounts = {
  weekend_start: string;
  weekend_end: string;
  score: number;
  counts: { yes: number; maybe: number; no: number; unset: number; total: number };
};

export type AvailabilityStatus = "yes" | "maybe" | "no" | "unset";

export function AvailabilityCounts({
  counts,
}: {
  counts: { yes: number; maybe: number; no: number; unset: number; total: number };
}) {
  return (
    <div className="flex items-center gap-2">
      {counts.yes > 0 && (
        <div className="flex items-center gap-1 border-2 border-black bg-poster-green px-2 py-0.5 dark:border-ink-dark/40">
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
            className="text-black dark:text-ink-dark"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-display text-[10px] font-bold text-black dark:text-ink-dark">{counts.yes}</span>
        </div>
      )}
      {counts.maybe > 0 && (
        <div className="flex items-center gap-1 border-2 border-black bg-poster-yellow px-2 py-0.5 dark:border-ink-dark/40">
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
            className="text-black dark:text-ink-dark"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12" y1="17" y2="17" />
          </svg>
          <span className="font-display text-[10px] font-bold text-black dark:text-ink-dark">{counts.maybe}</span>
        </div>
      )}
      {counts.no > 0 && (
        <div className="flex items-center gap-1 border-2 border-black bg-poster-orange px-2 py-0.5 dark:border-ink-dark/40">
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
            className="text-black dark:text-ink-dark"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" x2="9" y1="9" y2="15" />
            <line x1="9" x2="15" y1="9" y2="15" />
          </svg>
          <span className="font-display text-[10px] font-bold text-black dark:text-ink-dark">{counts.no}</span>
        </div>
      )}
      {counts.yes === 0 && counts.maybe === 0 && counts.no === 0 && (
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-400">
          No votes yet
        </span>
      )}
    </div>
  );
}

export function SegmentedAvailabilityControl({
  currentStatus,
  onSelect,
  disabled,
}: {
  currentStatus: AvailabilityStatus;
  onSelect: (status: AvailabilityStatus) => void;
  disabled?: boolean;
}) {
  const options: Array<{
    value: AvailabilityStatus;
    label: string;
    icon: ReactNode;
    bg: string;
    text: string;
    ariaLabel: string;
  }> = [
    {
      value: "yes",
      label: "Yes",
      ariaLabel: "Available",
      bg: "bg-poster-green border-black",
      text: "text-black",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      value: "maybe",
      label: "Maybe",
      ariaLabel: "Maybe available",
      bg: "bg-poster-yellow border-black",
      text: "text-black",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" x2="12" y1="17" y2="17" />
        </svg>
      ),
    },
    {
      value: "no",
      label: "No",
      ariaLabel: "Not available",
      bg: "bg-poster-orange border-black",
      text: "text-black",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="flex items-center gap-0 border-2 border-black bg-white p-0.5 dark:border-ink-dark/40 dark:bg-surface-dark-2"
      role="group"
      aria-label="Mark availability"
    >
      {options.map((opt) => {
        const isSelected = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={opt.ariaLabel}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
              isSelected
                ? `${opt.bg} border-2 ${opt.text} shadow-[2px_2px_0px_0px_#000]`
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface AvailabilityRowProps {
  weekend: WeekendWithCounts;
  currentStatus: AvailabilityStatus;
  onStatusChange: (status: AvailabilityStatus) => void;
  isSaving?: boolean;
  showCounts?: boolean;
}

export function AvailabilityRow({
  weekend,
  currentStatus,
  onStatusChange,
  isSaving = false,
  showCounts = true,
}: AvailabilityRowProps) {
  const start = parseISO(weekend.weekend_start);
  const end = parseISO(weekend.weekend_end);
  const dateRange =
    weekend.weekend_start === weekend.weekend_end
      ? format(start, "MMM dd")
      : `${format(start, "MMM dd")} – ${format(end, "MMM dd")}`;
  const weekdayRange =
    weekend.weekend_start === weekend.weekend_end
      ? format(start, "EEEE")
      : `${format(start, "EEEE")} – ${format(end, "EEEE")}`;

  return (
    <div className="flex flex-col gap-3 border-b-2 border-black pb-4 last:border-b-0 dark:border-ink-dark/40">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-sans text-lg font-bold text-black dark:text-white">{dateRange}</span>
          <span className="font-display text-xs font-bold uppercase tracking-widest text-brand-500">
            {weekdayRange}
          </span>
        </div>
        {weekend.score > 0 && (
          <div className="flex items-center gap-1 border-2 border-black bg-poster-blue px-2.5 py-1 dark:border-ink-dark/40">
            <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white">
              Score: {weekend.score}
            </span>
          </div>
        )}
      </div>
      {showCounts && <AvailabilityCounts counts={weekend.counts} />}
      <SegmentedAvailabilityControl
        currentStatus={currentStatus}
        onSelect={onStatusChange}
        disabled={isSaving}
      />
      {isSaving && (
        <div
          className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-400"
          role="status"
          aria-live="polite"
        >
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
}
