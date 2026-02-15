"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has seen welcome modal
        const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
        if (!hasSeenWelcome) {
            // Delay slightly to feel more natural
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("hasSeenWelcome", "true");
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Welcome!">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <p className="font-sans text-sm text-slate-600 dark:text-slate-300">
                        Welcome to <span className="font-bold text-black dark:text-white">WeekendSync</span>, the easiest way to plan group trips with your friends.
                    </p>
                    <ul className="list-disc pl-5 font-sans text-sm text-slate-600 dark:text-slate-300">
                        <li>Create trips and invite your squad</li>
                        <li>Vote on dates and destinations</li>
                        <li>Collaborate on an itinerary</li>
                        <li>Track shared expenses</li>
                    </ul>
                </div>

                <div className="rounded-xl border-2 border-black bg-poster-yellow p-4 dark:border-white">
                    <p className="font-display text-xs font-bold uppercase tracking-widest text-black">
                        Pro Tip: Start by creating a trip and sharing the invite code!
                    </p>
                </div>

                <Button onClick={handleClose} className="w-full">
                    Get Started
                </Button>
            </div>
        </Modal>
    );
}
