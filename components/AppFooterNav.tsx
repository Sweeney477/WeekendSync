"use client";

import { useRouter } from "next/navigation";

const linkClass =
  "group flex flex-col items-center gap-1 rounded-lg transition-[transform,opacity,background-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:flex-row md:gap-2 md:px-4 md:py-2.5 md:hover:bg-black/5 dark:md:hover:bg-white/5";

export function AppFooterNav({ isAuthed }: { isAuthed: boolean }) {
  const router = useRouter();

  return (
    <nav
      className="mt-auto flex justify-center gap-16 px-4 pt-6 pb-2 sm:gap-8 sm:px-2 md:mx-auto md:max-w-2xl md:gap-6 md:px-6 md:pb-4 border-t-4 border-black dark:border-ink-dark/40"
      aria-label="Main navigation"
    >
      <button
        type="button"
        className={`${linkClass} text-primary`}
        onClick={() => router.push("/")}
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
          className="shrink-0 transition-transform group-hover:scale-110"
          aria-hidden
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-tighter md:text-xs md:normal-case md:tracking-normal">Home</span>
      </button>
      <button
        type="button"
        className={`${linkClass} opacity-60 hover:opacity-100`}
        onClick={() => (isAuthed ? router.push("/trips") : router.push("/sign-in"))}
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
          className="shrink-0 transition-transform group-hover:scale-110"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-tighter md:text-xs md:normal-case md:tracking-normal">Trips</span>
      </button>
      <button
        type="button"
        className={`${linkClass} opacity-60 hover:opacity-100`}
        onClick={() => (isAuthed ? router.push("/calendars") : router.push("/sign-in"))}
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
          className="shrink-0 transition-transform group-hover:scale-110"
          aria-hidden
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-tighter md:text-xs md:normal-case md:tracking-normal">Calendars</span>
      </button>
      <button
        type="button"
        className={`${linkClass} opacity-60 hover:opacity-100`}
        onClick={() => (isAuthed ? router.push("/profile") : router.push("/sign-in"))}
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
          className="shrink-0 transition-transform group-hover:scale-110"
          aria-hidden
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-tighter md:text-xs md:normal-case md:tracking-normal">
          {isAuthed ? "Profile" : "Log In"}
        </span>
      </button>
    </nav>
  );
}
