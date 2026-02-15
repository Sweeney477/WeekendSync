
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SetupProgress } from "@/components/trip/SetupProgress";

export default async function SetupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, selected_city, weekend_type, preferences_json")
    .eq("id", tripId)
    .single();

  if (!trip) {
    notFound();
  }

  // Transform for client component
  const progressTripData = {
    id: trip.id,
    selectedCity: trip.selected_city,
    weekendType: trip.weekend_type,
    preferencesJson: trip.preferences_json,
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <SetupProgress trip={progressTripData} />
      {children}
    </div>
  );
}
