import { requireTripMember } from "@/lib/auth/server";
import { SportsDetailsSetupClient } from "../sports-details-setup-client";

export default async function SetupSportsDetailsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId, { allowCookieWrites: false });
  return <SportsDetailsSetupClient tripId={tripId} />;
}
