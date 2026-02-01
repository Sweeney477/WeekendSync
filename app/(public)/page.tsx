import { Suspense } from "react";
import { HomeClient } from "./home-client";
import { Skeleton } from "@/components/ui/Skeleton";

function LandingSkeleton() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col p-6">
      <div className="mb-16 pt-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
      <div className="mb-12">
        <Skeleton className="aspect-square w-full border-4 border-black dark:border-ink-dark/40" />
      </div>
      <div className="flex-grow space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-3/4" />
      </div>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}

