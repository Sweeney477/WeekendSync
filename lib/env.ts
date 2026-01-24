import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  TICKETMASTER_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
});

export type Env = z.infer<typeof serverSchema>;

export function getEnv(): Env {
  // In the browser, only validate client vars
  if (typeof window !== "undefined") {
    const clientEnv = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    // We cast to Env because the client only needs the public keys,
    // but the type definition includes server keys as optional.
    const parsed = clientSchema.safeParse(clientEnv);
    if (!parsed.success) {
      console.error("❌ Invalid client environment variables:", parsed.error.flatten().fieldErrors);
      throw new Error("Missing/invalid client environment variables.");
    }
    return parsed.data as Env;
  }

  // On the server, validate everything
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TICKETMASTER_API_KEY: process.env.TICKETMASTER_API_KEY,
  };

  const parsed = serverSchema.safeParse(env);
  if (!parsed.success) {
    console.error("❌ Invalid server environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Missing/invalid server environment variables.");
  }
  return parsed.data;
}
