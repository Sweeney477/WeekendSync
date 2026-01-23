import type { EventDTO } from "./types";

export function normalizeTicketmasterResponse(raw: any): EventDTO[] {
  const events = raw?._embedded?.events;
  if (!Array.isArray(events)) return [];

  return events
    .map((e: any): EventDTO | null => {
      const externalEventId = String(e?.id ?? "");
      const title = String(e?.name ?? "").trim();
      const startTimeISO = e?.dates?.start?.dateTime ?? null;

      const venue = e?._embedded?.venues?.[0]?.name ?? undefined;
      const category =
        e?.classifications?.[0]?.segment?.name ?? e?.classifications?.[0]?.genre?.name ?? undefined;

      const url = e?.url ?? undefined;

      if (!externalEventId || !title || !startTimeISO) return null;

      return { externalEventId, title, startTimeISO, venue, category, url } satisfies EventDTO;
    })
    .filter((e): e is EventDTO => e !== null);
}

