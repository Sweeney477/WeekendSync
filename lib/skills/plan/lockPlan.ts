import type { SupabaseClient } from "@supabase/supabase-js";
import type { LockPlanInput } from "./types";

export async function lockPlan(supabase: SupabaseClient, input: LockPlanInput) {
  if (input.actorRole !== "organizer") {
    throw new Error("Only the organizer can lock the plan");
  }

  const { error } = await supabase
    .from("trips")
    .update({
      status: "locked",
      selected_weekend_start: input.selectedWeekendStart,
      selected_destination_id: input.selectedDestinationId,
    })
    .eq("id", input.tripId);

  if (error) throw new Error(`Failed to lock plan: ${error.message}`);

  return { ok: true as const };
}

