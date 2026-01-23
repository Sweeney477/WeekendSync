import type { RankedBallot, RankedChoiceInput, RankedChoiceResult } from "./types";

function firstValidChoice(ballot: RankedBallot, remaining: Set<string>): string | null {
  for (const c of ballot.rankings) {
    if (remaining.has(c)) return c;
  }
  return null;
}

export function computeRankedChoiceWinner(input: RankedChoiceInput): RankedChoiceResult {
  const candidates = Array.from(new Set(input.candidates));
  const remaining = new Set(candidates);

  // Filter ballots to only known candidates and de-dupe rankings per ballot
  const ballots = input.ballots.map((b) => {
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const c of b.rankings) {
      if (!remaining.has(c)) continue;
      if (seen.has(c)) continue;
      seen.add(c);
      cleaned.push(c);
    }
    return { ...b, rankings: cleaned };
  });

  if (candidates.length === 0) return { winner: null, rounds: [] };
  if (candidates.length === 1) return { winner: candidates[0], rounds: [] };

  // First-choice overall counts for deterministic tie-breaks
  const firstChoiceOverall: Record<string, number> = Object.fromEntries(candidates.map((c) => [c, 0]));
  for (const b of ballots) {
    const c = b.rankings[0];
    if (c && firstChoiceOverall[c] !== undefined) firstChoiceOverall[c] += 1;
  }

  const rounds: RankedChoiceResult["rounds"] = [];

  while (remaining.size > 0) {
    const counts: Record<string, number> = Object.fromEntries(Array.from(remaining).map((c) => [c, 0]));
    let active = 0;

    for (const b of ballots) {
      const choice = firstValidChoice(b, remaining);
      if (!choice) continue;
      counts[choice] += 1;
      active += 1;
    }

    rounds.push({ counts: { ...counts }, totalActiveBallots: active });

    if (active === 0) {
      return { winner: null, rounds };
    }

    // Majority?
    for (const c of remaining) {
      if (counts[c] > active / 2) {
        return { winner: c, rounds };
      }
    }

    // Find lowest count among remaining
    let min = Infinity;
    for (const c of remaining) min = Math.min(min, counts[c]);

    const lowest = Array.from(remaining).filter((c) => counts[c] === min);

    // Deterministic elimination of ONE candidate per round:
    // 1) Fewest first-choice overall
    // 2) Lexicographic by candidate id
    lowest.sort((a, b) => {
      const fa = firstChoiceOverall[a] ?? 0;
      const fb = firstChoiceOverall[b] ?? 0;
      if (fa !== fb) return fa - fb; // eliminate fewer first-choice overall
      return a.localeCompare(b);
    });

    const eliminated = lowest[0];
    remaining.delete(eliminated);
    rounds[rounds.length - 1].eliminated = [eliminated];

    // If one left, they win
    if (remaining.size === 1) {
      return { winner: Array.from(remaining)[0], rounds };
    }
  }

  return { winner: null, rounds };
}

