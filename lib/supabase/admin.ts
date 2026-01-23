import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

export function createAdminSupabaseClient() {
  const env = getEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

