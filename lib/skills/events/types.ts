export type EventDTO = {
  externalEventId: string;
  title: string;
  startTimeISO: string; // ISO string
  venue?: string;
  category?: string;
  url?: string;
};

export type SearchEventsInput = {
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  category?: string;
};

