import type { SupabaseClient } from "@supabase/supabase-js";
import type { MembershipCheckResult, MembershipRole } from "./types";

export async function assertTripMember(
  supabase: SupabaseClient,
  tripId: string,
  userId: string
): Promise<MembershipCheckResult> {
  const { data, error } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Membership check failed: ${error.message}`);
  if (!data?.role) throw new Error("Not a member of this trip");

  return { isMember: true, role: data.role as MembershipRole };
}

