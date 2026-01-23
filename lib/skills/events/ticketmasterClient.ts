import type { SearchEventsInput } from "./types";

function toStartISO(date: string) {
  return `${date}T00:00:00Z`;
}
function toEndISO(date: string) {
  return `${date}T23:59:59Z`;
}

export async function fetchTicketmasterEvents(input: SearchEventsInput): Promise<any> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) throw new Error("Missing TICKETMASTER_API_KEY");

  const params = new URLSearchParams({
    apikey: apiKey,
    city: input.city,
    startDateTime: toStartISO(input.startDate),
    endDateTime: toEndISO(input.endDate),
    size: "50",
    sort: "date,asc",
  });

  if (input.category) params.set("classificationName", input.category);

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ticketmaster error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

