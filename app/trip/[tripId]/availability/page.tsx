import { AvailabilityClient } from "./availability-client";

export default async function AvailabilityPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <AvailabilityClient tripId={tripId} />;
}

