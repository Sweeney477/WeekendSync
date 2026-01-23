import { DestinationsClient } from "./destinations-client";

export default async function DestinationsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <DestinationsClient tripId={tripId} />;
}

