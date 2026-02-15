"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { PartyPopperIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const CURRENT_VERSION = "ws_whats_new_v1";

export function WhatsNewModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(CURRENT_VERSION);
        if (!hasSeen) {
            // Small delay to not overwhelm on initial load
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem(CURRENT_VERSION, "true");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-poster-yellow/20 text-poster-yellow dark:bg-yellow-900/30 dark:text-yellow-400">
                        <PartyPopperIcon className="h-6 w-6" />
                    </div>
                    <DialogTitle className="font-display text-2xl uppercase tracking-wide">
                        What&apos;s New in WeekendSync
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        We&apos;ve been busy making trip planning even easier! Here are a few highlights:
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex gap-3">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-zinc-800 dark:text-slate-400">1</div>
                        <div>
                            <h4 className="font-bold">Help Center</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Detailed guides on Voting, Costs, and more.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-zinc-800 dark:text-slate-400">2</div>
                        <div>
                            <h4 className="font-bold">Quick Actions</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Invite friends and add items faster with the new FAB.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-zinc-800 dark:text-slate-400">3</div>
                        <div>
                            <h4 className="font-bold">Persistent Navigation</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Easily jump between trip sections with the new sidebar.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button onClick={handleClose} className="w-full bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black">
                        Got it, let&apos;s explore!
                    </Button>
                    <Link href="/roadmap" onClick={handleClose} className="text-center text-sm text-slate-500 underline hover:text-black dark:hover:text-white">
                        See what&apos;s coming next
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
