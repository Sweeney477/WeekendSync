import { addDays, format, parseISO, startOfWeek } from "date-fns";

/** Weekend start = Friday (weekStartsOn: 5). Weekend end = Sunday = start + 2 days. */
export function getWeekendFromEventDate(
  isoDate: string
): { weekendStart: string; weekendEnd: string } | null {
  try {
    const d = parseISO(isoDate);
    const friday = startOfWeek(d, { weekStartsOn: 5 });
    const sunday = addDays(friday, 2);
    return {
      weekendStart: format(friday, "yyyy-MM-dd"),
      weekendEnd: format(sunday, "yyyy-MM-dd"),
    };
  } catch {
    return null;
  }
}
