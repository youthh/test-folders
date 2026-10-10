import { config, dateDurationMinutes, dateIdeas } from "./config";
import { toDateTime } from "./dateUtils";
import { triggerDownload } from "./download";
import { DatePlan } from "./types";

// Усі часи побачення — за київським часом (сайт зроблений під конкретну
// людину/місто, не універсальний віджет).
const TIME_ZONE = "Europe/Kyiv";

const pad = (n: number) => String(n).padStart(2, "0");

// Визначення часової зони, щоб клієнт календаря не залежав від того, чи
// знає він назву "Europe/Kyiv" (стара база tzdata має лише "Europe/Kiev").
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TIME_ZONE}`,
  "BEGIN:STANDARD",
  "DTSTART:19701025T040000",
  "TZOFFSETFROM:+0300",
  "TZOFFSETTO:+0200",
  "TZNAME:EET",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:19700329T030000",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0300",
  "TZNAME:EEST",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
];

/** Момент у UTC: "20261015T163000Z". DTSTAMP за RFC 5545 — завжди UTC. */
const toUTCStamp = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

/** Унікальний UID: два запрошення на один час не мають збігатися. */
const newUID = () => {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${id}@date-invite`;
};

const encoder = new TextEncoder();

/**
 * RFC 5545: рядок не довший за 75 октетів (UTF-8 байтів, а не символів);
 * продовження починається з пробілу, який теж входить у ліміт.
 */
const foldLine = (line: string) => {
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  let limit = 75;
  Array.from(line).forEach((ch) => {
    const bytes = encoder.encode(ch).length;
    if (size + bytes > limit) {
      parts.push(current);
      current = "";
      size = 0;
      limit = 74;
    }
    current += ch;
    size += bytes;
  });
  parts.push(current);
  return parts.join("\r\n ");
};

/** Дата у форматі "20261015T193000" (локальний час, без TZID). */
const toStamp = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}00`;

const ideaLabel = (id: string) =>
  dateIdeas.find((idea) => idea.id === id)?.label ?? id;

const summaryOf = () =>
  `Побачення${config.herName ? ` з ${config.herName}` : ""} 💌`;

const descriptionOf = (plan: DatePlan) =>
  [
    `Що робимо: ${plan.ideas.map(ideaLabel).join(", ")}`,
    plan.note ? `Побажання: ${plan.note}` : "",
    config.myName ? `Від: ${config.myName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const eventWindow = (plan: DatePlan) => {
  const start = toDateTime(plan.day, plan.time);
  const end = new Date(start.getTime() + dateDurationMinutes * 60000);
  return { start, end };
};

/** Екранує спецсимволи ICS (RFC 5545) і переносить рядки в літеральне "\n". */
const escapeICS = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");

export const buildICS = (plan: DatePlan) => {
  const { start, end } = eventWindow(plan);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//date-invite//uk",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${newUID()}`,
    `DTSTAMP:${toUTCStamp(new Date())}`,
    `DTSTART;TZID=${TIME_ZONE}:${toStamp(start)}`,
    `DTEND;TZID=${TIME_ZONE}:${toStamp(end)}`,
    `SUMMARY:${escapeICS(summaryOf())}`,
    `DESCRIPTION:${escapeICS(descriptionOf(plan))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // ICS вимагає CRLF-переноси рядків, у тому числі після останнього
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
};

/**
 * Формує .ics-файл побачення і одразу пропонує його зберегти/відкрити.
 * Працює на реальному сайті; у деяких пісочницях (як прев'ю-редактори)
 * завантаження файлів заблоковане — там варто пропонувати
 * buildGoogleCalendarUrl замість цього.
 */
export const downloadICS = (plan: DatePlan) => {
  const blob = new Blob([buildICS(plan)], {
    type: "text/calendar;charset=utf-8",
  });
  // ASCII-ім'я — кирилиця в download-атрибуті ненадійна на деяких
  // пристроях (зокрема iOS Safari)
  triggerDownload(blob, "date-invite.ics");
};

/**
 * Посилання «додати подію» в Google Calendar — просто відкриває нову
 * вкладку, нічого не завантажує, тому працює навіть у пісочницях, де
 * downloadICS заблокований.
 */
export const buildGoogleCalendarUrl = (plan: DatePlan) => {
  const { start, end } = eventWindow(plan);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summaryOf(),
    dates: `${toStamp(start)}/${toStamp(end)}`,
    details: descriptionOf(plan),
    ctz: TIME_ZONE,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
