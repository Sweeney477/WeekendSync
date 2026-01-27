"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface TripHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export function TripHeader({ title, subtitle, showSearch }: TripHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-slate-50/80 px-4 py-4 backdrop-blur-md dark:bg-surface-dark/80">
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 dark:text-ink-dark dark:hover:bg-surface-dark-2"
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
        <h1 className="text-lg font-bold text-slate-900 dark:text-ink-dark">{title}</h1>
        {subtitle && <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1">
        {showSearch && (
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 dark:text-ink-dark dark:hover:bg-surface-dark-2">
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        )}
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 dark:text-ink-dark dark:hover:bg-surface-dark-2"
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
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 dark:text-ink-dark dark:hover:bg-surface-dark-2">
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
  );
}
