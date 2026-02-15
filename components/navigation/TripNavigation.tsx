"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface TripNavigationProps {
    tripId: string;
    className?: string;
    badges?: {
        dashboard?: number;
        plan?: number;
        voting?: number;
        weekends?: number;
        setup?: number;
    };
}

export function TripNavigation({ tripId, className, badges }: TripNavigationProps) {
    const pathname = usePathname();

    const links = [
        {
            href: `/trip/${tripId}/dashboard`,
            label: "Dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            ),
            badge: badges?.dashboard,
        },
        {
            href: `/trip/${tripId}/plan`,
            label: "Plan",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            ),
            badge: badges?.plan,
        },
        {
            href: `/trip/${tripId}/availability`,
            label: "Availability",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></svg>
            ),
        },
        {
            href: `/trip/${tripId}/weekends`,
            label: "Weekends",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            ),
            badge: badges?.weekends,
        },
        {
            href: `/trip/${tripId}/voting`,
            label: "Voting",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4" /><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" /><path d="M22 19H2" /></svg>
            ),
            badge: badges?.voting,
        },
        {
            href: `/trip/${tripId}/setup`,
            label: "Setup",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            ),
            badge: badges?.setup,
        },
        {
            href: `/help`,
            label: "Help",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
            ),
        }
    ];

    return (
        <nav className={cn("flex w-full overflow-x-auto border-b-4 border-black bg-white md:w-64 md:flex-col md:border-b-0 md:border-r-4 dark:border-white dark:bg-zinc-900", className)}>
            <div className="flex w-full md:flex-col">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex flex-1 items-center justify-center gap-3 px-4 py-4 transition-all hover:bg-slate-100 md:justify-start dark:hover:bg-zinc-800",
                                {
                                    "bg-poster-yellow hover:bg-poster-yellow dark:bg-brand-600 dark:hover:bg-brand-600": isActive,
                                }
                            )}
                        >
                            <div className={cn("text-slate-500 group-hover:text-black dark:text-slate-400 dark:group-hover:text-white", { "text-black dark:text-white": isActive })}>
                                {link.icon}
                            </div>
                            <span className={cn("hidden font-display text-sm font-bold uppercase tracking-wider text-slate-500 group-hover:text-black md:inline dark:text-slate-400 dark:group-hover:text-white", { "text-black dark:text-white": isActive })}>
                                {link.label}
                            </span>
                            {link.badge && link.badge > 0 && (
                                <Badge count={link.badge} className="ml-auto" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
