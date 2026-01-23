import { describe, expect, it } from "vitest";
import { generateWeekends } from "./generateWeekends";

describe("generateWeekends", () => {
  it("generates count weekends", () => {
    const weekends = generateWeekends({ fromDate: "2026-01-11", count: 12 }); // Sunday
    expect(weekends).toHaveLength(12);
  });

  it("snaps to next Friday if fromDate is not Friday", () => {
    const weekends = generateWeekends({ fromDate: "2026-01-11", count: 1 }); // Sunday
    expect(weekends[0].weekendStart).toBe("2026-01-16"); // next Fri
    expect(weekends[0].weekendEnd).toBe("2026-01-18"); // Sun
  });

  it("includes same weekend if fromDate is Friday", () => {
    const weekends = generateWeekends({ fromDate: "2026-01-16", count: 1 }); // Friday
    expect(weekends[0].weekendStart).toBe("2026-01-16");
    expect(weekends[0].weekendEnd).toBe("2026-01-18");
  });
});

