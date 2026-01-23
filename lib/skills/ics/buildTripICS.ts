import type { BuildICSInput } from "./types";

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function yyyymmdd(date: string): string {
  return date.replaceAll("-", "");
}

function dtstampUTC(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function addDays(dateYYYYMMDD: string, days: number): string {
  const [y, m, d] = dateYYYYMMDD.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function isoToDT(iso: string): string {
  // UTC format for simplicity
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) throw new Error(`Invalid ISO date: ${iso}`);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");
  const ss = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function isoPlusHours(iso: string, hours: number): string {
  const dt = new Date(iso);
  dt.setUTCHours(dt.getUTCHours() + hours);
  return dt.toISOString();
}

export function buildTripICS(input: BuildICSInput): string {
  const { trip, events } = input;

  const lines: string[] = [];
  const stamp = dtstampUTC();

  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//WeekendSync//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");

  // All-day event covering Fri–Sun inclusive
  // For all-day events, DTEND is exclusive (end+1 day)
  const dtStart = yyyymmdd(trip.weekendStart);
  const dtEndExclusive = yyyymmdd(addDays(trip.weekendEnd, 1));

  lines.push("BEGIN:VEVENT");
  lines.push(`UID:trip-${escapeICS(trip.tripId)}@weekendsync`);
  lines.push(`DTSTAMP:${stamp}`);
  lines.push(`SUMMARY:${escapeICS(`WeekendSync: ${trip.tripName}`)}`);
  lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
  lines.push(`DTEND;VALUE=DATE:${dtEndExclusive}`);
  lines.push("END:VEVENT");

  // Timed events (default 2hr duration)
  const top = events.slice(0, 3);
  top.forEach((e, idx) => {
    const uid = `event-${escapeICS(trip.tripId)}-${idx}@weekendsync`;
    const startDT = isoToDT(e.startTimeISO);
    const endDT = isoToDT(isoPlusHours(e.startTimeISO, 2));

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`SUMMARY:${escapeICS(e.title)}`);
    lines.push(`DTSTART:${startDT}`);
    lines.push(`DTEND:${endDT}`);
    if (e.venue) lines.push(`LOCATION:${escapeICS(e.venue)}`);
    if (e.url) lines.push(`URL:${escapeICS(e.url)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  // ICS expects CRLF newlines
  return lines.join("\r\n") + "\r\n";
}

