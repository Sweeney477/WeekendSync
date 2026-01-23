export type WeekendRange = {
  weekendStart: string; // YYYY-MM-DD (Friday)
  weekendEnd: string; // YYYY-MM-DD (Sunday)
};

export type GenerateWeekendsInput = {
  fromDate: string; // YYYY-MM-DD
  count: number; // e.g. 12
};

