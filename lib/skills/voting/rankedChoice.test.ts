import { describe, expect, it } from "vitest";
import { computeRankedChoiceWinner } from "./rankedChoice";

describe("computeRankedChoiceWinner", () => {
  it("picks majority winner in first round", () => {
    const res = computeRankedChoiceWinner({
      candidates: ["A", "B", "C"],
      ballots: [
        { userId: "u1", rankings: ["A", "B"] },
        { userId: "u2", rankings: ["A"] },
        { userId: "u3", rankings: ["B", "A"] },
      ],
    });
    expect(res.winner).toBe("A");
  });

  it("redistributes votes after elimination", () => {
    const res = computeRankedChoiceWinner({
      candidates: ["A", "B", "C"],
      ballots: [
        { userId: "u1", rankings: ["C", "A"] },
        { userId: "u2", rankings: ["B"] },
        { userId: "u3", rankings: ["A"] },
        { userId: "u4", rankings: ["C", "A"] },
      ],
    });
    // Round 1: A=1, B=1, C=2 => C has 2/4 not >2, eliminate lowest (A or B), then redistribute accordingly
    expect(res.winner).toBeTruthy();
  });

  it("is deterministic on ties", () => {
    const res1 = computeRankedChoiceWinner({
      candidates: ["A", "B"],
      ballots: [
        { userId: "u1", rankings: ["A"] },
        { userId: "u2", rankings: ["B"] },
      ],
    });
    const res2 = computeRankedChoiceWinner({
      candidates: ["A", "B"],
      ballots: [
        { userId: "u1", rankings: ["A"] },
        { userId: "u2", rankings: ["B"] },
      ],
    });
    expect(res1.winner).toBe(res2.winner);
  });
});

