import type { AvailabilityRow, ScoreAvailabilityInput, WeekendScore } from "./types";

export function scoreAvailability(input: ScoreAvailabilityInput): WeekendScore[] {
  const { weekends, rows, memberIds, totalMembers } = input;

  const total =
    typeof totalMembers === "number"
      ? totalMembers
      : Array.isArray(memberIds)
        ? memberIds.length
        : undefined;

  const map = new Map<string, WeekendScore>();
  for (const w of weekends) {
    map.set(w.weekendStart, {
      weekendStart: w.weekendStart,
      yes: 0,
      maybe: 0,
      no: 0,
      unset: 0,
      score: 0,
    });
  }

  for (const r of rows) {
    const item = map.get(r.weekendStart);
    if (!item) continue; // ignore rows not in current weekend set

    if (r.status === "yes") item.yes += 1;
    else if (r.status === "maybe") item.maybe += 1;
    else if (r.status === "no") item.no += 1;
    else item.unset += 1; // explicit unset row (rare)
  }

  const out = Array.from(map.values()).map((w) => {
    const score = w.yes * 2 + w.maybe * 1;
    const computedUnset =
      typeof total === "number" ? Math.max(0, total - (w.yes + w.maybe + w.no)) : w.unset;

    return { ...w, unset: computedUnset, score };
  });

  out.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.yes !== a.yes) return b.yes - a.yes;
    // earliest weekend first
    return a.weekendStart.localeCompare(b.weekendStart);
  });

  return out;
}

