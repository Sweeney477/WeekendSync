import { z } from "zod";

export const upsertVoteSchema = z.object({
  voteType: z.enum(["weekend", "destination"]),
  rankings: z.record(z.string(), z.string()),
});

export type UpsertVoteInput = z.infer<typeof upsertVoteSchema>;

