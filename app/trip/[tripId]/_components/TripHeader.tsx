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
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b-4 border-black bg-white px-4 py-4 dark:border-white dark:bg-zinc-900">
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-poster-yellow dark:border-white dark:bg-zinc-800 dark:text-white dark:hover:bg-poster-yellow dark:hover:text-black"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className="flex flex-col items-center text-center">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider text-black dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-poster-blue opacity-80">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showSearch && (
          <button className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-poster-yellow dark:border-white dark:bg-zinc-800 dark:text-white dark:hover:bg-poster-yellow dark:hover:text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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
          className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-poster-green hover:text-white dark:border-white dark:bg-zinc-800 dark:text-white"
          aria-label="Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
