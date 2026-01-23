import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().trim().min(1).max(80),
  firstDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected yyyy-mm-dd"),
  // Renamed from lookaheadWeeks in the UI to match product language
  planningWindowWeeks: z.number().int().min(1).max(52).optional(),
  // Back-compat: older clients may still send this
  lookaheadWeeks: z.number().int().min(1).max(52).optional(),
  timeframeMode: z.enum(["weekend", "long_weekend", "week", "dinner", "custom"]),
  tripLengthDays: z.number().int().min(1).max(30).optional(),
}).superRefine((val, ctx) => {
  if (val.timeframeMode === "custom") {
    if (!val.tripLengthDays || !Number.isInteger(val.tripLengthDays)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tripLengthDays is required for custom trips" });
    }
  }
});

export const joinTripSchema = z.object({
  inviteCode: z.string().trim().min(4).max(32),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type JoinTripInput = z.infer<typeof joinTripSchema>;

