import { describe, expect, it } from "vitest";
import {
  eventsSearchQuerySchema,
  selectEventSchema,
  ticketmasterSearchSchema,
} from "./events";

describe("events validation", () => {
  describe("eventsSearchQuerySchema", () => {
    it("accepts valid guided search params", () => {
      const res = eventsSearchQuerySchema.parse({
        tripId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        city: "Chicago",
        windowStart: "2025-06-01",
        windowEnd: "2025-06-15",
      });
      expect(res.city).toBe("Chicago");
      expect(res.windowStart).toBe("2025-06-01");
      expect(res.windowEnd).toBe("2025-06-15");
    });

    it("accepts sport and team", () => {
      const res = eventsSearchQuerySchema.parse({
        tripId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        city: "Boston",
        windowStart: "2025-07-01",
        windowEnd: "2025-07-07",
        sport: "baseball",
        team: "Red Sox",
      });
      expect(res.sport).toBe("baseball");
      expect(res.team).toBe("Red Sox");
    });

    it("rejects missing required fields", () => {
      expect(() =>
        eventsSearchQuerySchema.parse({
          tripId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          city: "Chicago",
        })
      ).toThrow();
      expect(() =>
        eventsSearchQuerySchema.parse({
          tripId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          windowStart: "2025-06-01",
          windowEnd: "2025-06-15",
        })
      ).toThrow();
    });

    it("rejects invalid date format", () => {
      expect(() =>
        eventsSearchQuerySchema.parse({
          tripId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          city: "Chicago",
          windowStart: "06/01/2025",
          windowEnd: "2025-06-15",
        })
      ).toThrow();
    });
  });

  describe("selectEventSchema", () => {
    it("accepts valid select-event body", () => {
      const body = {
        provider: "ticketmaster",
        event: {
          provider: "ticketmaster",
          externalEventId: "evt1",
          title: "Cubs vs Cardinals",
          startTime: "2025-07-15T19:00:00Z",
          venue: "Wrigley Field",
          url: "https://ticketmaster.com/evt1",
        },
      };
      expect(selectEventSchema.parse(body)).toEqual(body);
    });

    it("rejects missing provider", () => {
      expect(() =>
        selectEventSchema.parse({
          event: {
            provider: "ticketmaster",
            externalEventId: "x",
            title: "Game",
            startTime: "2025-07-15T19:00:00Z",
          },
        })
      ).toThrow();
    });

    it("rejects invalid event shape", () => {
      expect(() =>
        selectEventSchema.parse({
          provider: "ticketmaster",
          event: {
            externalEventId: "x",
            title: "",
            startTime: "2025-07-15T19:00:00Z",
          },
        })
      ).toThrow();
    });
  });

  describe("ticketmasterSearchSchema (legacy)", () => {
    it("requires city or keyword", () => {
      expect(() =>
        ticketmasterSearchSchema.parse({
          startDate: "2025-06-01",
          endDate: "2025-06-15",
        })
      ).toThrow();
      expect(
        ticketmasterSearchSchema.parse({
          city: "Chicago",
          startDate: "2025-06-01",
          endDate: "2025-06-15",
        })
      ).toBeDefined();
      expect(
        ticketmasterSearchSchema.parse({
          keyword: "baseball",
          startDate: "2025-06-01",
          endDate: "2025-06-15",
        })
      ).toBeDefined();
    });
  });
});
