import { requireTripMember } from "@/lib/auth/server";
import { ItinerarySetupClient } from "../itinerary-setup-client";

export default async function SetupItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId, { allowCookieWrites: false });
  return <ItinerarySetupClient tripId={tripId} />;
}
