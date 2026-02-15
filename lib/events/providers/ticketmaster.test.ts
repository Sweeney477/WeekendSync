import { describe, expect, it } from "vitest";
import { normalizeTicketmasterEvent } from "./ticketmaster";

describe("normalizeTicketmasterEvent", () => {
  it("returns null for missing id or name", () => {
    expect(normalizeTicketmasterEvent({})).toBeNull();
    expect(normalizeTicketmasterEvent({ id: "x" })).toBeNull();
    expect(normalizeTicketmasterEvent({ name: "Game" })).toBeNull();
  });

  it("maps Ticketmaster payload to NormalizedEvent", () => {
    const payload = {
      id: "evt123",
      name: "Cubs vs Cardinals",
      url: "https://ticketmaster.com/evt123",
      dates: {
        start: {
          dateTime: "2025-07-15T19:00:00Z",
          localDate: "2025-07-15",
        },
      },
      _embedded: {
        venues: [
          {
            name: "Wrigley Field",
            city: { name: "Chicago" },
          },
        ],
      },
      images: [{ url: "https://example.com/img.jpg", width: 640 }],
    };
    const result = normalizeTicketmasterEvent(payload);
    expect(result).not.toBeNull();
    expect(result?.provider).toBe("ticketmaster");
    expect(result?.externalEventId).toBe("evt123");
    expect(result?.title).toBe("Cubs vs Cardinals");
    expect(result?.startTime).toBe("2025-07-15T19:00:00Z");
    expect(result?.venue).toBe("Wrigley Field");
    expect(result?.city).toBe("Chicago");
    expect(result?.url).toBe("https://ticketmaster.com/evt123");
    expect(result?.imageUrl).toBe("https://example.com/img.jpg");
    expect(result?.ticketAvailabilityStatus).toBe("unknown");
  });

  it("uses localDate when dateTime missing", () => {
    const payload = {
      id: "evt456",
      name: "Game",
      dates: {
        start: { localDate: "2025-08-01" },
      },
    };
    const result = normalizeTicketmasterEvent(payload);
    expect(result?.startTime).toBe("2025-08-01T12:00:00Z");
  });

  it("returns null when start time cannot be derived", () => {
    const payload = {
      id: "x",
      name: "Game",
      dates: {},
    };
    const result = normalizeTicketmasterEvent(payload);
    expect(result).toBeNull();
  });
});
