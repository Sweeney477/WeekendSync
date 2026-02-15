import { requireTripMember } from "@/lib/auth/server";
import { CitySetupClient } from "../city-setup-client";

export default async function SetupCityPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId, { allowCookieWrites: false });
  return <CitySetupClient tripId={tripId} />;
}
