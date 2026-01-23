export type AvailabilityStatus = "yes" | "maybe" | "no" | "unset";

export type AvailabilityRow = {
  weekendStart: string; // YYYY-MM-DD
  userId: string;
  status: AvailabilityStatus;
};

export type WeekendScore = {
  weekendStart: string;
  yes: number;
  maybe: number;
  no: number;
  unset: number;
  score: number; // yes*2 + maybe*1
};

export type ScoreAvailabilityInput = {
  weekends: { weekendStart: string }[];
  rows: AvailabilityRow[];
  // Optional: to compute unset correctly
  memberIds?: string[];
  totalMembers?: number;
};

