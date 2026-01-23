import { VotingClient } from "./voting-client";

export default async function VotingPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <VotingClient tripId={tripId} />;
}

