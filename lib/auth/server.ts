import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  return { supabase, user: data.user };
}

export async function requireProfile() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile?.display_name) redirect("/onboarding");
  return { supabase, user, profile };
}

export async function requireTripMember(tripId: string) {
  const { supabase, user, profile } = await requireProfile();
  const { data: member } = await supabase
    .from("trip_members")
    .select("trip_id, user_id, role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) redirect("/");
  return { supabase, user, profile, member };
}

