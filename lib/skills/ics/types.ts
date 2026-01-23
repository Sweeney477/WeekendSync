export type TripForICS = {
  tripId: string;
  tripName: string;
  weekendStart: string; // YYYY-MM-DD (Fri)
  weekendEnd: string; // YYYY-MM-DD (Sun)
  timezone: string; // e.g. America/Chicago
};

export type EventForICS = {
  title: string;
  startTimeISO: string; // ISO
  url?: string;
  venue?: string;
};

export type BuildICSInput = {
  trip: TripForICS;
  events: EventForICS[];
};

