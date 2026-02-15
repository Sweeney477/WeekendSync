import { requireTripMember } from "@/lib/auth/server";
import { GamesSetupClient } from "../games-setup-client";

export default async function SetupGamesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId, { allowCookieWrites: false });
  return <GamesSetupClient tripId={tripId} />;
}
