import { Suspense } from "react";
import { HomeClient } from "./home-client";

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md px-4 py-8 text-sm text-slate-600">Loading…</div>}>
      <HomeClient />
    </Suspense>
  );
}

