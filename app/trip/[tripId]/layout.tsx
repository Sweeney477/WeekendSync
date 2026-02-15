import { TripHeader } from "./_components/TripHeader";
import { TripNavigation } from "@/components/navigation/TripNavigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { QuickActions } from "@/components/trip/QuickActions";
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
    .select("name, invite_code")
    .eq("id", tripId)
    .maybeSingle();

  const tripName = trip?.name ?? "Trip";

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background-light dark:bg-background-dark md:flex-row">
      <TripNavigation
        tripId={tripId}
        className="fixed bottom-0 left-0 z-50 h-auto w-full md:sticky md:top-0 md:h-dvh md:w-64"
      />

      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <TripHeader title={tripName} />
        <div className="mx-auto w-full max-w-md px-4 py-2 md:max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/home" },
              { label: tripName, href: `/trip/${tripId}/dashboard` },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-md md:max-w-3xl">
          {children}
        </div>
        <QuickActions tripId={tripId} inviteCode={trip?.invite_code} />
      </main>
    </div>
  );
}

