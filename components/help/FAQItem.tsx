"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

interface FAQItemProps {
    question: string;
    answer: React.ReactNode;
}

export function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b-2 border-slate-100 last:border-0 dark:border-zinc-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-start justify-between py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50"
            >
                <span className="pr-4 font-display text-sm font-bold uppercase tracking-wide text-black dark:text-white">
                    {question}
                </span>
                <ChevronDownIcon
                    className={cn(
                        "h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500",
                        isOpen && "rotate-180 text-black dark:text-white"
                    )}
                />
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="pb-4 pt-1 font-sans text-sm text-slate-600 dark:text-slate-300">
                    {answer}
                </div>
            </div>
        </div>
    );
}
