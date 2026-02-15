"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background-light p-4 text-center dark:bg-background-dark">
            <h2 className="font-display text-2xl font-bold uppercase text-black dark:text-white">
                Something went wrong!
            </h2>
            <p className="max-w-xs font-sans text-sm text-slate-600 dark:text-slate-400">
                We encountered an unexpected error.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="secondary">
                    Try again
                </Button>
                <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
            </div>
        </div>
    );
}
