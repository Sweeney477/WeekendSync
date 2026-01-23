import { EventsClient } from "./events-client";

export default async function EventsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <EventsClient tripId={tripId} />;
}

