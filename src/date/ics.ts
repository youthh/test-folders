import { config, dateDurationMinutes, dateIdeas } from "./config";
import { toDateTime } from "./dateUtils";
import { DatePlan } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Дата у форматі ICS: "20261015T193000" (локальний час, без TZID). */
const toICSStamp = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}00`;

/** Екранує спецсимволи ICS (RFC 5545) і переносить рядки в літеральне "\n". */
const escapeICS = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

const ideaLabel = (id: string) =>
  dateIdeas.find((idea) => idea.id === id)?.label ?? id;

export const buildICS = (plan: DatePlan) => {
  const start = toDateTime(plan.day, plan.time);
  const end = new Date(start.getTime() + dateDurationMinutes * 60000);

  const summary = `Побачення${config.herName ? ` з ${config.herName}` : ""} 💌`;
  const description = [
    `Що робимо: ${plan.ideas.map(ideaLabel).join(", ")}`,
    plan.note ? `Побажання: ${plan.note}` : "",
    config.myName ? `Від: ${config.myName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//date-invite//uk",
    "BEGIN:VEVENT",
    `UID:${toICSStamp(start)}-date-invite@local`,
    `DTSTAMP:${toICSStamp(new Date())}`,
    `DTSTART:${toICSStamp(start)}`,
    `DTEND:${toICSStamp(end)}`,
    `SUMMARY:${escapeICS(summary)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // ICS вимагає CRLF-переноси рядків
  return lines.join("\r\n");
};

/** Формує .ics-файл побачення і одразу пропонує його зберегти/відкрити. */
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
