import type { TicketmasterEvent } from "@/lib/ticketmaster";
import { searchEvents as ticketmasterSearch } from "@/lib/ticketmaster";
import type {
  EventsProvider,
  NormalizedEvent,
  EventSearchInput,
  TicketAvailabilityStatus,
} from "@/lib/events/types";

const PROVIDER_KEY = "ticketmaster";

function deriveSport(e: TicketmasterEvent): string | undefined {
  const segment = e.classifications?.[0]?.segment?.name;
  if (segment) return segment.toLowerCase();
  if (e.name?.toLowerCase().includes("baseball")) return "baseball";
  if (e.name?.toLowerCase().includes("football")) return "football";
  return undefined;
}

function deriveVenue(e: TicketmasterEvent): string | null {
  const name = e._embedded?.venues?.[0]?.name;
  return name ? String(name) : null;
}

function deriveCity(e: TicketmasterEvent): string | undefined {
  const city = e._embedded?.venues?.[0]?.city?.name;
  return city ? String(city) : undefined;
}

function deriveStartISO(e: TicketmasterEvent): string {
  const start = e.dates?.start;
  if (start?.dateTime) return String(start.dateTime);
  if (start?.localDate)
    return `${start.localDate}T12:00:00Z`;
  return "";
}

function pickBestImage(images: TicketmasterEvent["images"]): string | null {
  if (!images?.length) return null;
  const preferred = images.find((i) => i.width >= 400) ?? images[0];
  return preferred?.url ? String(preferred.url) : null;
}

function deriveAvailability(_e: TicketmasterEvent): TicketAvailabilityStatus {
  return "unknown";
}

export function normalizeTicketmasterEvent(payload: unknown): NormalizedEvent | null {
  const e = payload as TicketmasterEvent;
  if (!e?.id || !e?.name) return null;
  const startTime = deriveStartISO(e);
  if (!startTime) return null;

  return {
    provider: PROVIDER_KEY,
    externalEventId: String(e.id),
    title: String(e.name),
    sport: deriveSport(e),
    city: deriveCity(e),
    venue: deriveVenue(e),
    startTime,
    url: e.url ? String(e.url) : null,
    imageUrl: pickBestImage(e.images),
    ticketAvailabilityStatus: deriveAvailability(e),
    raw: payload,
  };
}

export const ticketmasterProvider: EventsProvider = {
  providerKey: PROVIDER_KEY,

  async searchEvents(input: EventSearchInput): Promise<NormalizedEvent[]> {
    const keyword =
      input.team ?? (input.sport === "baseball" ? "baseball" : input.sport);
    const raw = await ticketmasterSearch({
      city: input.city,
      keyword: keyword ?? undefined,
      startDateTime: `${input.windowStart}T00:00:00Z`,
      endDateTime: `${input.windowEnd}T23:59:59Z`,
      size: input.limit ?? 24,
      countryCode: "US",
    });
    return raw
      .map((r) => this.normalizeEvent(r))
      .filter((n): n is NormalizedEvent => n !== null);
  },

  normalizeEvent(payload: unknown): NormalizedEvent | null {
    return normalizeTicketmasterEvent(payload);
  },
};
