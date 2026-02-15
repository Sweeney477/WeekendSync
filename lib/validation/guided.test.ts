import { describe, expect, it } from "vitest";
import {
  sportsPreferencesSchema,
  weekendTypeSchema,
  citySelectionSchema,
} from "./guided";

describe("guided validation", () => {
  describe("weekendTypeSchema", () => {
    it("accepts valid weekend types", () => {
      expect(weekendTypeSchema.parse("friends")).toBe("friends");
      expect(weekendTypeSchema.parse("sports")).toBe("sports");
      expect(weekendTypeSchema.parse("other")).toBe("other");
    });

    it("rejects invalid weekend type", () => {
      expect(() => weekendTypeSchema.parse("invalid")).toThrow();
    });
  });

  describe("citySelectionSchema", () => {
    it("accepts city only", () => {
      expect(citySelectionSchema.parse({ city: "Chicago" })).toEqual({
        city: "Chicago",
      });
    });

    it("accepts city with state and country", () => {
      expect(
        citySelectionSchema.parse({
          city: "San Francisco",
          stateCode: "CA",
          countryCode: "US",
        })
      ).toEqual({
        city: "San Francisco",
        stateCode: "CA",
        countryCode: "US",
      });
    });

    it("rejects empty city", () => {
      expect(() => citySelectionSchema.parse({ city: "" })).toThrow();
    });
  });

  describe("sportsPreferencesSchema", () => {
    it("accepts valid date window within 90 days", () => {
      const start = "2025-06-01";
      const end = "2025-06-15";
      expect(
        sportsPreferencesSchema.parse({
          dateWindowStart: start,
          dateWindowEnd: end,
        })
      ).toMatchObject({ dateWindowStart: start, dateWindowEnd: end });
    });

    it("rejects inverted date range", () => {
      expect(() =>
        sportsPreferencesSchema.parse({
          dateWindowStart: "2025-06-15",
          dateWindowEnd: "2025-06-01",
        })
      ).toThrow();
    });

    it("rejects date window over 90 days", () => {
      expect(() =>
        sportsPreferencesSchema.parse({
          dateWindowStart: "2025-01-01",
          dateWindowEnd: "2025-05-01",
        })
      ).toThrow();
    });

    it("accepts sport and teamQuery", () => {
      const res = sportsPreferencesSchema.parse({
        sport: "baseball",
        teamQuery: "Cubs",
        dateWindowStart: "2025-06-01",
        dateWindowEnd: "2025-06-07",
      });
      expect(res.sport).toBe("baseball");
      expect(res.teamQuery).toBe("Cubs");
    });
  });
});
