import { Suspense } from "react";
import { JoinClient } from "./join-client";

export default async function JoinByInviteCodePage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = await params;

  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md px-4 py-8 text-sm text-slate-600">Loading…</div>}>
      <JoinClient inviteCode={inviteCode} />
    </Suspense>
  );
}

