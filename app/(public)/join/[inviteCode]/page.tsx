import { Suspense } from "react";
import { JoinClient } from "./join-client";
import { Skeleton } from "@/components/ui/Skeleton";

function JoinSkeleton() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 py-8 pb-24">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-1 items-center justify-center py-8">
        <Skeleton className="h-6 w-32" />
      </div>
    </main>
  );
}

export default async function JoinByInviteCodePage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = await params;

  return (
    <Suspense fallback={<JoinSkeleton />}>
      <JoinClient inviteCode={inviteCode} />
    </Suspense>
  );
}

