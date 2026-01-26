import { TripHeaderWithNav } from "./_components/TripHeaderWithNav";
import { requireTripMember } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const { supabase } = await requireTripMember(tripId, { allowCookieWrites: false });

  // Fetch trip name for the header
  const { data: trip } = await supabase
    .from("trips")
    .select("name")
    .eq("id", tripId)
    .maybeSingle();

  const tripName = trip?.name ?? "Trip";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background-light dark:bg-background-dark">
      <TripHeaderWithNav tripId={tripId} tripName={tripName} />
      {children}
    </main>
  );
}

