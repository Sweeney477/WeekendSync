function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatUtcDateTime(dt: Date) {
  return (
    dt.getUTCFullYear() +
    pad2(dt.getUTCMonth() + 1) +
    pad2(dt.getUTCDate()) +
    "T" +
    pad2(dt.getUTCHours()) +
    pad2(dt.getUTCMinutes()) +
    pad2(dt.getUTCSeconds()) +
    "Z"
  );
}

function formatDateValue(dateYYYYMMDD: string) {
  // input: YYYY-MM-DD -> YYYYMMDD
  return dateYYYYMMDD.replaceAll("-", "");
}

function escapeText(s: string) {
  return s.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function foldLine(line: string) {
  // RFC5545: 75 octets; we approximate by 74 chars and fold with CRLF + space.
  const limit = 74;
  if (line.length <= limit) return line;
  let out = "";
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + limit);
    out += (i === 0 ? "" : "\r\n ") + chunk;
    i += limit;
  }
  return out;
}

export type IcsEvent =
  | {
      uid: string;
      summary: string;
      description?: string;
      allDay: true;
      startDate: string; // YYYY-MM-DD
      endDateExclusive: string; // YYYY-MM-DD
      url?: string | null;
      location?: string | null;
    }
  | {
      uid: string;
      summary: string;
      description?: string;
      allDay?: false;
      startTimeUtc: string; // ISO
      endTimeUtc?: string; // ISO
      url?: string | null;
      location?: string | null;
    };

export function buildIcsCalendar({ calName, events }: { calName: string; events: IcsEvent[] }) {
  const now = new Date();
  const dtstamp = formatUtcDateTime(now);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WeekendSync//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calName)}`,
  ];

  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeText(e.uid)}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`SUMMARY:${escapeText(e.summary)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);

    if ("allDay" in e && e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatDateValue(e.startDate)}`);
      lines.push(`DTEND;VALUE=DATE:${formatDateValue(e.endDateExclusive)}`);
    } else {
      const start = new Date((e as any).startTimeUtc);
      const end = (e as any).endTimeUtc ? new Date((e as any).endTimeUtc) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      lines.push(`DTSTART:${formatUtcDateTime(start)}`);
      lines.push(`DTEND:${formatUtcDateTime(end)}`);
    }

    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    if (e.url) lines.push(`URL:${escapeText(e.url)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

