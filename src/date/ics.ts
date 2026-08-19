import { config, dateDurationMinutes, dateIdeas } from "./config";
import { toDateTime } from "./dateUtils";
import { DatePlan } from "./types";

// Усі часи побачення — за київським часом (сайт зроблений під конкретну
// людину/місто, не універсальний віджет).
const TIME_ZONE = "Europe/Kyiv";

const pad = (n: number) => String(n).padStart(2, "0");

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
    .replace(/\n/g, "\\n");

export const buildICS = (plan: DatePlan) => {
  const { start, end } = eventWindow(plan);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//date-invite//uk",
    "BEGIN:VEVENT",
    `UID:${toStamp(start)}-date-invite@local`,
    `DTSTAMP:${toStamp(new Date())}`,
    `DTSTART:${toStamp(start)}`,
    `DTEND:${toStamp(end)}`,
    `SUMMARY:${escapeICS(summaryOf())}`,
    `DESCRIPTION:${escapeICS(descriptionOf(plan))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // ICS вимагає CRLF-переноси рядків
  return lines.join("\r\n");
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
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // ASCII-ім'я — кирилиця в download-атрибуті ненадійна на деяких
  // пристроях (зокрема iOS Safari)
  a.download = "date-invite.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
