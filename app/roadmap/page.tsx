import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const ROADMAP_ITEMS = [
    {
        status: "Complete",
        items: [
            "Trip Dashboard",
            "Vote on Dates & Locations",
            "Split Costs",
            "Persistent Navigation",
            "Help Center",
        ],
    },
    {
        status: "In Progress",
        items: [
            "Feature Discovery (You are here!)",
            "Feedback Collection",
            "Performance Improvements",
        ],
    },
    {
        status: "Planned",
        items: [
            "Calendar Export (.ics)",
            "Offline Mode (PWA)",
            "Photo Gallery",
            "Group Chat Integration",
            "AI Itinerary Suggestions",
        ],
    },
];

export default function RoadmapPage() {
    return (
        <div className="min-h-screen bg-background-light pb-20 pt-24 dark:bg-background-dark">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 font-display text-4xl font-bold uppercase tracking-wider text-black dark:text-white md:text-6xl">
                        Public Roadmap
                    </h1>
                    <p className="font-sans text-xl text-slate-600 dark:text-slate-300">
                        See what we&apos;ve built and what&apos;s coming next for WeekendSync.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {ROADMAP_ITEMS.map((column) => (
                        <div key={column.status} className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <h2 className={cn(
                                "mb-6 flex items-center justify-between font-display text-xl font-bold uppercase tracking-wider",
                                column.status === "Complete" ? "text-green-600 dark:text-green-400" :
                                    column.status === "In Progress" ? "text-poster-yellow dark:text-yellow-400" :
                                        "text-slate-500 dark:text-slate-400"
                            )}>
                                {column.status}
                                <span className="font-sans text-sm font-normal normal-case text-slate-400 dark:text-slate-500">
                                    {column.items.length} items
                                </span>
                            </h2>
                            <ul className="space-y-4">
                                {column.items.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className={cn(
                                            "mt-1.5 h-2 w-2 rounded-full",
                                            column.status === "Complete" ? "bg-green-500" :
                                                column.status === "In Progress" ? "bg-poster-yellow animate-pulse" :
                                                    "bg-slate-300 dark:bg-zinc-700"
                                        )} />
                                        <span className="font-sans text-slate-700 dark:text-slate-200">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
