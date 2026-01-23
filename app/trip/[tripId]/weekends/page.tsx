import { WeekendsClient } from "./weekends-client";

export default async function WeekendsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <WeekendsClient tripId={tripId} />;
}

