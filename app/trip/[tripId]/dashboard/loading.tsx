import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TripDashboardLoading() {
    return (
        <div className="flex flex-col gap-8 px-4 pb-24 pt-4">
            {/* Group Status Skeleton */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </Card>

            {/* Main Action Skeleton */}
            <div className="relative flex flex-col gap-4 border-4 border-slate-200 bg-slate-100 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="mt-6 h-14 w-full" />
            </div>

            {/* Stats/Rankings Skeleton */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </Card>
                <Card className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </Card>
            </div>

            {/* Members List Skeleton */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between border-2 border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10" />
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
