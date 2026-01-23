export type LockPlanInput = {
  tripId: string;
  selectedWeekendStart: string; // YYYY-MM-DD
  selectedDestinationId: string; // uuid
  actorRole: "organizer" | "member";
};

