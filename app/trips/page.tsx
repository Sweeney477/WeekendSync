import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TripsClient } from "./trips-client";

export default async function TripsPage() {
  const supabase = await createServerSupabaseClient({ allowCookieWrites: false });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/trips");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.display_name) {
    redirect("/onboarding?next=/trips");
  }

  return <TripsClient />;
}
