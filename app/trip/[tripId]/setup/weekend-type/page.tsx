import { requireTripMember } from "@/lib/auth/server";
import { WeekendTypeSetupClient } from "../weekend-type-setup-client";

export default async function SetupWeekendTypePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId, { allowCookieWrites: false });
  return <WeekendTypeSetupClient tripId={tripId} />;
}
