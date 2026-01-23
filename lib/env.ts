import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  TICKETMASTER_API_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
});

export type Env = z.infer<typeof serverSchema>;

export function getEnv(): Env {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TICKETMASTER_API_KEY: process.env.TICKETMASTER_API_KEY,
  };

  const parsed = serverSchema.safeParse(env);
  if (!parsed.success) {
    // Keep error short to avoid leaking env details.
    throw new Error("Missing/invalid environment variables. Check env.example.");
  }
  return parsed.data;
}

