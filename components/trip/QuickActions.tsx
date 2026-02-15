"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlusIcon, UserPlusIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
    tripId: string;
    inviteCode?: string;
}

export function QuickActions({ tripId, inviteCode }: QuickActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleInvite = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(false);

        if (!inviteCode) {
            toast.error("Invite code not available");
            return;
        }

        const inviteLink = `${window.location.origin}/join/${inviteCode}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Join my trip on WeekendSync",
                    url: inviteLink,
                });
            } else {
                await navigator.clipboard.writeText(inviteLink);
                toast.success("Invite link copied!");
            }
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(inviteLink);
                    toast.success("Invite link copied!");
                } catch {
                    toast.error("Failed to copy link");
                }
            }
        }
    };

    const actions = [
        {
            label: "Invite Member",
            href: "#",
            onClick: handleInvite,
            icon: <UserPlusIcon className="h-5 w-5" />,
            color: "bg-poster-green",
        },
        {
            label: "Add Activity",
            href: `/trip/${tripId}/plan?action=add-item`,
            icon: <CalendarIcon className="h-5 w-5" />,
            color: "bg-poster-yellow",
        },
        {
            label: "Add Expense",
            href: `/trip/${tripId}/plan?tab=costs&action=add-cost`,
            icon: <DollarSignIcon className="h-5 w-5" />,
            color: "bg-poster-pink",
        },
    ];

    return (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
            <div className={cn("flex flex-col gap-3 transition-all duration-300", {
                "opacity-0 translate-y-10 pointer-events-none": !isOpen,
                "opacity-100 translate-y-0 pointer-events-auto": isOpen,
            })}>
                {actions.map((action, index) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        onClick={(e) => {
                            if (action.onClick) action.onClick(e);
                            setIsOpen(false);
                        }}
                        className="group flex items-center justify-end gap-3"
                    >
                        <span className="rounded-md bg-black px-2 py-1 font-display text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all group-hover:scale-105 dark:bg-white dark:text-black">
                            {action.label}
                        </span>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full border-2 border-black text-black shadow-[4px_4px_0px_0px_#000] transition-transform hover:scale-110 active:translate-y-1 active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]", action.color)}>
                            {action.icon}
                        </div>
                    </Link>
                ))}
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:translate-y-1 active:shadow-none dark:border-white dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]",
                    { "rotate-45 bg-rose-500 border-rose-600 dark:bg-rose-500 dark:border-rose-500 dark:text-white": isOpen }
                )}
                aria-label="Quick Actions"
            >
                <PlusIcon className="h-8 w-8" />
            </button>

            {/* Backdrop - dim only, no blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
