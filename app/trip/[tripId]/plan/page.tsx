import { requireTripMember } from "@/lib/auth/server";
import { PlanClient } from "./plan-client";

export const dynamic = "force-dynamic";

export default async function TripPlanPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { user, supabase, member } = await requireTripMember(tripId, { allowCookieWrites: false });

  // Fetch trip details
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, name, invite_code, created_at, created_by")
    .eq("id", tripId)
    .maybeSingle();

  if (tripError || !trip) {
    // If trip not found, redirect to home
    const { redirect } = await import("next/navigation");
    redirect("/");
    return;
  }

  return (
    <div className="flex flex-col">
      <PlanClient tripId={tripId} userRole={member.role} />
    </div>
  );
}
