import { z } from "zod";

export const ticketmasterSearchSchema = z.object({
  city: z.string().trim().min(1).max(120),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().trim().min(1).max(80).optional(),
});

export const saveEventSchema = z.object({
  externalEventId: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  startTime: z.string().datetime(),
  venue: z.string().trim().min(1).max(200).nullable().optional(),
  category: z.string().trim().min(1).max(80).nullable().optional(),
  url: z.string().url().nullable().optional(),
});

export const voteEventSchema = z.object({
  eventId: z.string().uuid(),
});

export type TicketmasterSearchInput = z.infer<typeof ticketmasterSearchSchema>;
export type SaveEventInput = z.infer<typeof saveEventSchema>;
export type VoteEventInput = z.infer<typeof voteEventSchema>;

