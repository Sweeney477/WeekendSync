import { z } from "zod";

export const upsertProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  homeCity: z.string().trim().min(1).max(120).nullable().optional(),
});

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;

