import type { GenerateWeekendsInput, WeekendRange } from "./types";

function parseDateUTC(yyyyMmDd: string): Date {
  // Interprets date-only as UTC midnight to avoid DST/local offsets
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Invalid date: ${yyyyMmDd}`);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateUTC(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysUTC(dt: Date, days: number): Date {
  const copy = new Date(dt.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/**
 * Generates the next N Fri–Sun weekend ranges starting from fromDate.
 * - If fromDate is Friday, that weekend is included.
 * - Otherwise snaps to the next Friday.
 */
export function generateWeekends(input: GenerateWeekendsInput): WeekendRange[] {
  const { fromDate, count } = input;
  if (!Number.isInteger(count) || count <= 0) throw new Error("count must be a positive integer");

  const start = parseDateUTC(fromDate);
  const weekday = start.getUTCDay(); // 0=Sun ... 5=Fri
  const FRIDAY = 5;
  const daysToFriday = (FRIDAY - weekday + 7) % 7;

  const firstFriday = addDaysUTC(start, daysToFriday);

  const weekends: WeekendRange[] = [];
  for (let i = 0; i < count; i++) {
    const weekendStart = addDaysUTC(firstFriday, i * 7);
    const weekendEnd = addDaysUTC(weekendStart, 2); // Sunday
    weekends.push({
      weekendStart: formatDateUTC(weekendStart),
      weekendEnd: formatDateUTC(weekendEnd),
    });
  }
  return weekends;
}

