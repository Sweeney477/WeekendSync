import { describe, it, expect } from "vitest";
import { getWeekendFromEventDate } from "./weekend-from-event";

describe("getWeekendFromEventDate", () => {
  it("returns Fri–Sun for a Saturday game", () => {
    // 2025-06-14 is Saturday
    const result = getWeekendFromEventDate("2025-06-14T19:00:00Z");
    expect(result).toEqual({ weekendStart: "2025-06-13", weekendEnd: "2025-06-15" });
  });

  it("returns Fri–Sun for a Friday game", () => {
    const result = getWeekendFromEventDate("2025-06-13T19:00:00Z");
    expect(result).toEqual({ weekendStart: "2025-06-13", weekendEnd: "2025-06-15" });
  });

  it("returns Fri–Sun for a Sunday game", () => {
    const result = getWeekendFromEventDate("2025-06-15T13:00:00Z");
    expect(result).toEqual({ weekendStart: "2025-06-13", weekendEnd: "2025-06-15" });
  });

  it("returns null for invalid date", () => {
    expect(getWeekendFromEventDate("invalid")).toBeNull();
  });

  it("groups multiple games on same weekend", () => {
    const sat = getWeekendFromEventDate("2025-06-14T19:00:00Z");
    const sun = getWeekendFromEventDate("2025-06-15T13:00:00Z");
    expect(sat).toEqual(sun);
    expect(sat).toEqual({ weekendStart: "2025-06-13", weekendEnd: "2025-06-15" });
  });
});
