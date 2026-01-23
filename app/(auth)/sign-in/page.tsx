import { Suspense } from "react";
import { SignInClient } from "./sign-in-client";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md px-4 py-8 text-sm text-slate-600">Loading…</div>}>
      <SignInClient />
    </Suspense>
  );
}

