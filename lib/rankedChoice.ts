export type RankedChoiceCandidate = {
  id: string;
  createdAt: string | Date;
};

export type RankedChoiceVote = {
  rankings: Record<string, string>;
};

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function getOrderedChoices(rankings: Record<string, string>): string[] {
  return Object.entries(rankings)
    .filter(([rank, value]) => rank && value)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, v]) => v);
}

export type RankedChoiceRound = {
  round: number;
  totals: Record<string, number>;
  activeVotes: number;
  eliminated?: string;
  winner?: string;
};

export function computeRankedChoiceWinner(
  votes: RankedChoiceVote[],
  candidates: RankedChoiceCandidate[],
): { winnerId: string | null; rounds: RankedChoiceRound[] } {
  const createdAtById = new Map(candidates.map((c) => [c.id, toDate(c.createdAt)] as const));
  const alive = new Set(candidates.map((c) => c.id));
  const rounds: RankedChoiceRound[] = [];

  if (alive.size === 0) return { winnerId: null, rounds };
  if (alive.size === 1) return { winnerId: [...alive][0]!, rounds: [{ round: 1, totals: { [[...alive][0]!]: votes.length }, activeVotes: votes.length, winner: [...alive][0]! }] };

  // Tie-break uses first-choice votes from round 1 (original preferences).
  const firstChoiceBaseline: Record<string, number> = Object.fromEntries([...alive].map((id) => [id, 0]));
  for (const v of votes) {
    const choices = getOrderedChoices(v.rankings);
    const first = choices.find((id) => alive.has(id));
    if (first) firstChoiceBaseline[first] = (firstChoiceBaseline[first] ?? 0) + 1;
  }

  const compareForWinner = (a: string, b: string, totals: Record<string, number>) => {
    const ta = totals[a] ?? 0;
    const tb = totals[b] ?? 0;
    if (ta !== tb) return tb - ta; // higher totals first
    const fa = firstChoiceBaseline[a] ?? 0;
    const fb = firstChoiceBaseline[b] ?? 0;
    if (fa !== fb) return fb - fa; // higher first-choice first
    const da = createdAtById.get(a)?.getTime() ?? 0;
    const db = createdAtById.get(b)?.getTime() ?? 0;
    return da - db; // earlier created wins
  };

  const compareForElimination = (a: string, b: string, totals: Record<string, number>) => {
    const ta = totals[a] ?? 0;
    const tb = totals[b] ?? 0;
    if (ta !== tb) return ta - tb; // lower totals first
    const fa = firstChoiceBaseline[a] ?? 0;
    const fb = firstChoiceBaseline[b] ?? 0;
    if (fa !== fb) return fa - fb; // lower first-choice first
    const da = createdAtById.get(a)?.getTime() ?? 0;
    const db = createdAtById.get(b)?.getTime() ?? 0;
    return db - da; // later created eliminated first
  };

  let roundNum = 0;
  while (alive.size > 0) {
    roundNum += 1;
    const totals: Record<string, number> = Object.fromEntries([...alive].map((id) => [id, 0]));
    let activeVotes = 0;

    for (const v of votes) {
      const choices = getOrderedChoices(v.rankings);
      const pick = choices.find((id) => alive.has(id));
      if (!pick) continue;
      totals[pick] = (totals[pick] ?? 0) + 1;
      activeVotes += 1;
    }

    const aliveList = [...alive];
    aliveList.sort((a, b) => compareForWinner(a, b, totals));
    const leader = aliveList[0]!;
    const leaderVotes = totals[leader] ?? 0;

    if (activeVotes > 0 && leaderVotes > activeVotes / 2) {
      rounds.push({ round: roundNum, totals, activeVotes, winner: leader });
      return { winnerId: leader, rounds };
    }

    if (alive.size === 1) {
      rounds.push({ round: roundNum, totals, activeVotes, winner: leader });
      return { winnerId: leader, rounds };
    }

    // Eliminate lowest with deterministic tie-break.
    const eliminationOrder = [...alive];
    eliminationOrder.sort((a, b) => compareForElimination(a, b, totals));
    const eliminated = eliminationOrder[0]!;
    alive.delete(eliminated);

    rounds.push({ round: roundNum, totals, activeVotes, eliminated });
  }

  return { winnerId: null, rounds };
}

