import { describe, expect, it } from "vitest";
import { scoreAvailability } from "./scoreAvailability";

describe("scoreAvailability", () => {
  it("computes score yes*2 + maybe", () => {
    const res = scoreAvailability({
      weekends: [{ weekendStart: "2026-01-16" }],
      rows: [
        { weekendStart: "2026-01-16", userId: "u1", status: "yes" },
        { weekendStart: "2026-01-16", userId: "u2", status: "maybe" },
        { weekendStart: "2026-01-16", userId: "u3", status: "no" },
      ],
      totalMembers: 3,
    });

    expect(res[0].yes).toBe(1);
    expect(res[0].maybe).toBe(1);
    expect(res[0].no).toBe(1);
    expect(res[0].score).toBe(3);
  });

  it("computes unset when totalMembers is provided", () => {
    const res = scoreAvailability({
      weekends: [{ weekendStart: "2026-01-16" }],
      rows: [{ weekendStart: "2026-01-16", userId: "u1", status: "yes" }],
      totalMembers: 3,
    });
    expect(res[0].unset).toBe(2);
  });
});

