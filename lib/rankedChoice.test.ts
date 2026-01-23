import { describe, expect, it } from "vitest";
import { computeRankedChoiceWinner, type RankedChoiceCandidate } from "./rankedChoice";

describe("computeRankedChoiceWinner", () => {
  it("returns null when no candidates", () => {
    const res = computeRankedChoiceWinner([], []);
    expect(res.winnerId).toBeNull();
  });

  it("selects majority winner in first round", () => {
    const candidates: RankedChoiceCandidate[] = [
      { id: "A", createdAt: "2026-01-01T00:00:00Z" },
      { id: "B", createdAt: "2026-01-01T00:00:01Z" },
    ];
    const votes = [
      { rankings: { "1": "A" } },
      { rankings: { "1": "A" } },
      { rankings: { "1": "B" } },
    ];
    const res = computeRankedChoiceWinner(votes, candidates);
    expect(res.winnerId).toBe("A");
  });

  it("redistributes votes after elimination (instant-runoff)", () => {
    const candidates: RankedChoiceCandidate[] = [
      { id: "A", createdAt: "2026-01-01T00:00:00Z" },
      { id: "B", createdAt: "2026-01-01T00:00:01Z" },
      { id: "C", createdAt: "2026-01-01T00:00:02Z" },
    ];
    const votes = [
      { rankings: { "1": "A", "2": "B" } },
      { rankings: { "1": "C", "2": "B" } },
      { rankings: { "1": "C", "2": "B" } },
      { rankings: { "1": "B" } },
    ];
    // Round1: A=1, B=1, C=2 (no >50%); eliminate A, its vote goes to B => B=2, C=2 tie, then tie-break via first-choice (C has 2, B has 1) => C wins.
    const res = computeRankedChoiceWinner(votes, candidates);
    expect(res.winnerId).toBe("C");
    expect(res.rounds.length).toBeGreaterThanOrEqual(2);
  });

  it("breaks ties deterministically by first-choice then earliest created", () => {
    const candidates: RankedChoiceCandidate[] = [
      { id: "A", createdAt: "2026-01-01T00:00:00Z" }, // earliest
      { id: "B", createdAt: "2026-01-01T00:00:01Z" },
      { id: "C", createdAt: "2026-01-01T00:00:02Z" },
    ];
    const votes = [
      { rankings: { "1": "A" } },
      { rankings: { "1": "B" } },
      { rankings: { "1": "C" } },
    ];
    // All tied. No majority. Elimination: lowest totals tie; baseline first-choice tie; eliminate latest-created first (C), then same for B, leaving A.
    const res = computeRankedChoiceWinner(votes, candidates);
    expect(res.winnerId).toBe("A");
  });
});

