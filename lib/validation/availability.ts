import { z } from "zod";

export const upsertAvailabilitySchema = z.object({
  weekendStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["yes", "maybe", "no", "unset"]),
});

export type UpsertAvailabilityInput = z.infer<typeof upsertAvailabilitySchema>;

