"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function TripError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Trip Error:", error);
    }, [error]);

    return (
        <div className="flex h-dvh w-full items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
            <Card className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-2xl">
                    ⚠️
                </div>
                <div>
                    <h2 className="font-display text-xl font-bold uppercase text-black dark:text-white">
                        Trip Unavailable
                    </h2>
                    <p className="mt-2 font-sans text-sm text-slate-600 dark:text-slate-400">
                        {error.message || "We couldn't load this trip. It might have been deleted or you may not have access."}
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                    <Button onClick={() => reset()} className="w-full">
                        Try again
                    </Button>
                    <Link href="/dashboard" className="w-full">
                        <Button variant="secondary" className="w-full">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
                <div className="mt-4 text-center">
                    <Link
                        href="/help"
                        className="text-xs text-slate-400 underline decoration-slate-300 underline-offset-4 hover:text-black dark:decoration-zinc-700 dark:hover:text-white"
                    >
                        Need help? Visit our support center
                    </Link>
                </div>
            </Card>
        </div>
    );
}
