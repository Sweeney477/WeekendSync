import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarsClient } from "./calendars-client";

export default async function CalendarsPage() {
  const supabase = await createServerSupabaseClient({ allowCookieWrites: false });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/calendars");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.display_name) {
    redirect("/onboarding?next=/calendars");
  }

  return <CalendarsClient />;
}
