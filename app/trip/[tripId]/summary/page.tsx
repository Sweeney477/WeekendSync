import { SummaryClient } from "./summary-client";

export default async function SummaryPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <SummaryClient tripId={tripId} />;
}

