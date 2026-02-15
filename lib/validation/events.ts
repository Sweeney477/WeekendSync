import { z } from "zod";

export const ticketmasterSearchSchema = z
  .object({
    city: z.preprocess(
      (s) => (s === "" || s === null ? undefined : s),
      z.string().trim().max(120).optional()
    ),
    keyword: z.preprocess(
      (s) => (s === "" || s === null ? undefined : s),
      z.string().trim().max(200).optional()
    ),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    category: z.string().trim().min(1).max(80).optional(),
  })
  .refine((d) => d.city || d.keyword, {
    message: "Provide city or keyword",
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

/** Query params for GET /api/events/search (guided flow / provider-agnostic) */
export const eventsSearchQuerySchema = z.object({
  tripId: z.string().uuid(),
  city: z.string().trim().min(1).max(120),
  sport: z.string().trim().max(40).optional(),
  team: z.string().trim().max(120).optional(),
  windowStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  windowEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  provider: z.string().trim().max(40).optional(),
});

/** Body for POST /api/trips/:id/select-event */
const normalizedEventSchema = z.object({
  provider: z.string().trim().min(1).max(40),
  externalEventId: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(500),
  sport: z.string().trim().max(40).optional(),
  league: z.string().trim().max(80).optional(),
  homeTeam: z.string().trim().max(120).optional(),
  awayTeam: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  venue: z.string().trim().max(200).nullable().optional(),
  startTime: z.string().min(1),
  url: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  ticketAvailabilityStatus: z.enum(["available", "limited", "unknown", "unavailable"]).optional(),
});

export const selectEventSchema = z.object({
  provider: z.string().trim().min(1).max(40),
  event: normalizedEventSchema,
  selectionContext: z
    .object({
      sourceQuery: z.record(z.string(), z.unknown()).optional(),
      rankedPosition: z.number().int().min(0).optional(),
    })
    .optional(),
});

export type TicketmasterSearchInput = z.infer<typeof ticketmasterSearchSchema>;
export type SaveEventInput = z.infer<typeof saveEventSchema>;
export type VoteEventInput = z.infer<typeof voteEventSchema>;
export type EventsSearchQueryInput = z.infer<typeof eventsSearchQuerySchema>;
export type SelectEventInput = z.infer<typeof selectEventSchema>;

