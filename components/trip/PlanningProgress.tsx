"use client";

import { Card } from "@/components/ui/Card";
import clsx from "clsx";

interface PlanningProgressProps {
    hasItems: boolean;
    hasCosts: boolean;
    hasMembers: boolean;
}

export function PlanningProgress({ hasItems: items, hasCosts: costs, hasMembers: members }: PlanningProgressProps) {
    const tripCreated = true;
    const friendInvited = members;
    const activityAdded = items;
    const expenseAdded = costs;

    const totalSteps = 4;
    let completedCount = 0;
    if (tripCreated) completedCount++;
    if (friendInvited) completedCount++;
    if (activityAdded) completedCount++;
    if (expenseAdded) completedCount++;

    const progress = (completedCount / totalSteps) * 100;

    const steps = [
        { label: "Trip Created", completed: tripCreated },
        { label: "Friends Invited", completed: friendInvited },
        { label: "Activity Added", completed: activityAdded },
        { label: "Expense Added", completed: expenseAdded },
    ];

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase tracking-wider text-black dark:text-white">
                    Planning Progress
                </h2>
                <span className="font-mono text-sm font-bold text-black dark:text-white">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full overflow-hidden rounded-full border-2 border-black bg-slate-100 dark:border-ink-dark/40 dark:bg-zinc-800">
                <div
                    className="h-full bg-poster-green transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {steps.map((step) => (
                    <div key={step.label} className="flex items-center gap-2">
                        <div
                            className={clsx(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                                step.completed
                                    ? "border-black bg-poster-green dark:border-transparent"
                                    : "border-slate-300 bg-transparent dark:border-slate-600"
                            )}
                        >
                            {step.completed && (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-2.5 w-2.5 text-white"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span
                            className={clsx(
                                "text-xs font-bold uppercase tracking-wide",
                                step.completed
                                    ? "text-black dark:text-white"
                                    : "text-slate-400 dark:text-slate-500"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
