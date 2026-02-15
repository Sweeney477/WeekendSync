/**
 * Provider-agnostic event types for WeekendSync.
 * V1: Ticketmaster-backed; contract supports future providers.
 */

export const WEEKEND_TYPES = [
  "friends",
  "concert",
  "sports",
  "food_bars",
  "chill",
  "other",
] as const;
export type WeekendType = (typeof WEEKEND_TYPES)[number];

export type EventSearchInput = {
  city: string;
  sport?: string;
  team?: string;
  windowStart: string; // YYYY-MM-DD
  windowEnd: string; // YYYY-MM-DD
  limit?: number;
};

export type TicketAvailabilityStatus =
  | "available"
  | "limited"
  | "unknown"
  | "unavailable";

export type NormalizedEvent = {
  provider: string;
  externalEventId: string;
  title: string;
  sport?: string;
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  city?: string;
  venue?: string | null;
  startTime: string; // ISO
  url?: string | null;
  imageUrl?: string | null;
  ticketAvailabilityStatus?: TicketAvailabilityStatus;
  raw?: unknown;
};

export interface EventsProvider {
  providerKey: string;
  searchEvents(input: EventSearchInput): Promise<NormalizedEvent[]>;
  normalizeEvent(payload: unknown): NormalizedEvent | null;
}

/** Request body for POST /api/trips/:id/select-event */
export type SelectEventRequestBody = {
  provider: string;
  event: NormalizedEvent;
  selectionContext?: {
    sourceQuery?: Record<string, unknown>;
    rankedPosition?: number;
  };
};

/** Response for POST /api/trips/:id/select-event */
export type SelectEventResponse = {
  tripId: string;
  selectedEventId: string;
  selectedAt: string; // ISO
  next: string;
};

/** Response for GET /api/events/search */
export type EventsSearchResponse = {
  events: NormalizedEvent[];
  meta: {
    provider: string;
    count: number;
    queryFingerprint?: string;
  };
};
