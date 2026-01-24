import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getEnv } from "@/lib/env";

type ServerSupabaseOptions = {
  allowCookieWrites?: boolean;
};

export async function createServerSupabaseClient(options: ServerSupabaseOptions = {}) {
  const cookieStore = await cookies();
  const env = getEnv();
  const allowCookieWrites = options.allowCookieWrites ?? true;

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: unknown }>) {
        if (!allowCookieWrites) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as any);
        });
      },
    },
  });
}

