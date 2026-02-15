import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { Weekend, Destination } from "./hooks";

interface WeekendCardProps {
    weekend: Weekend;
    rank: number;
    isSelected: boolean;
    onToggle: () => void;
}

export function WeekendCard({ weekend, rank, isSelected, onToggle }: WeekendCardProps) {
    const start = parseISO(weekend.weekend_start);
    const end = parseISO(weekend.weekend_end);
    const dateRange = `${format(start, "MMM dd")} – ${format(end, "MMM dd")}`;

    return (
        <button
            onClick={onToggle}
            className={`group flex w-full items-center justify-between rounded-xl border p-4 transition-all duration-300 ease-out active:scale-[0.99]
        ${isSelected
                    ? "border-primary bg-background-light shadow-md ring-1 ring-primary/20 dark:border-primary/50 dark:bg-surface-dark dark:shadow-none"
                    : "border-transparent bg-white shadow-sm hover:border-brand-200 hover:shadow-md dark:bg-surface-dark-2 dark:shadow-none dark:hover:bg-surface-dark"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-display text-xl font-bold transition-colors duration-300
          ${isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-brand-50 text-brand-300 dark:bg-zinc-800 dark:text-zinc-600"
                    }`}>
                    {isSelected ? rank : ""}
                </div>
                <div className="flex flex-col text-left">
                    <span className={`font-sans font-bold text-lg transition-colors ${isSelected ? "text-primary dark:text-primary" : "text-slate-700 dark:text-slate-200"}`}>
                        {dateRange}
                    </span>
                    <span className="font-display text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500">Standard Rate</span>
                </div>
            </div>
            <div className={`transition-colors duration-300 ${isSelected ? "text-primary" : "text-slate-300 group-hover:text-slate-400"}`}>
                <CheckCircleIcon filled={isSelected} />
            </div>
        </button>
    );
}

interface DestinationCardProps {
    destination: Destination;
    rank: number;
    isSelected: boolean;
    onToggle: () => void;
}

export function DestinationCard({ destination, rank, isSelected, onToggle }: DestinationCardProps) {
    return (
        <button
            onClick={onToggle}
            className={`group flex w-full items-center justify-between rounded-xl border p-4 transition-all duration-300 ease-out active:scale-[0.99]
        ${isSelected
                    ? "border-primary bg-background-light shadow-md ring-1 ring-primary/20 dark:border-primary/50 dark:bg-surface-dark dark:shadow-none"
                    : "border-transparent bg-white shadow-sm hover:border-brand-200 hover:shadow-md dark:bg-surface-dark-2 dark:shadow-none dark:hover:bg-surface-dark"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors duration-300 ${isSelected ? "border-primary" : "border-slate-100 dark:border-zinc-700"}`}>
                    <Image
                        src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=100&auto=format&fit=crop`}
                        alt={destination.city_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
                <div className="flex flex-col text-left">
                    <span className={`font-sans font-bold text-lg transition-colors ${isSelected ? "text-primary dark:text-primary" : "text-slate-700 dark:text-slate-200"}`}>
                        {destination.city_name}
                    </span>
                    <span className="font-display text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500">
                        {destination.rationale_tags?.[0] || "Recommended"}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isSelected && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-primary dark:text-rose-300">
                        Rank {rank}
                    </span>
                )}
                <div className={`transition-colors duration-300 ${isSelected ? "text-primary" : "text-slate-300 group-hover:text-slate-400"}`}>
                    <CheckCircleIcon filled={isSelected} />
                </div>
            </div>
        </button>
    );
}

function CheckCircleIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="opacity-100">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
        </svg>
    );
}
