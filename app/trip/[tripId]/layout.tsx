import { TripNav } from "./_components/TripNav";
import { requireTripMember } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50">
      {children}
    </main>
  );
}

