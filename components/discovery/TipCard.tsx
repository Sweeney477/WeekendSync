"use client";

import { useEffect, useState } from "react";
import { XIcon, LightbulbIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TipCardProps {
    id: string; // Unique ID for persistence
    title: string;
    description: string;
    className?: string;
}

export function TipCard({ id, title, description, className }: TipCardProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isDismissed = localStorage.getItem(`ws_tip_${id}`);
        if (!isDismissed) {
            setIsVisible(true);
        }
    }, [id]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(`ws_tip_${id}`, "true");
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            "relative flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 shadow-sm dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-100",
            className
        )}>
            <LightbulbIcon className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
                <h4 className="font-bold">{title}</h4>
                <p className="mt-1 opacity-90">{description}</p>
            </div>
            <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 rounded-full p-1 text-yellow-700 hover:bg-yellow-200/50 dark:text-yellow-400 dark:hover:bg-yellow-800/50"
            >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
            </button>
        </div>
    );
}
