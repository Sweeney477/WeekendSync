import { describe, expect, it } from "vitest";
import { buildTripICS } from "./buildTripICS";

describe("buildTripICS", () => {
  it("creates a valid VCALENDAR with trip event", () => {
    const ics = buildTripICS({
      trip: {
        tripId: "t1",
        tripName: "Test Trip",
        weekendStart: "2026-01-16",
        weekendEnd: "2026-01-18",
        timezone: "America/Chicago",
      },
      events: [],
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:WeekendSync: Test Trip");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260116");
    expect(ics).toContain("DTEND;VALUE=DATE:20260119"); // end exclusive
    expect(ics).toContain("END:VCALENDAR");
  });
});

