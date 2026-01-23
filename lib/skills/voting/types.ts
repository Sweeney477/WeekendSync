export type RankedBallot = {
  userId: string;
  rankings: string[]; // ordered candidate IDs, e.g. ["A","B","C"]
};

export type RankedChoiceResult = {
  winner: string | null;
  rounds: Array<{
    counts: Record<string, number>;
    eliminated?: string[];
    totalActiveBallots: number;
  }>;
};

export type RankedChoiceInput = {
  candidates: string[];
  ballots: RankedBallot[];
};

