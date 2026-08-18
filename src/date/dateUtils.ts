const WEEKDAYS_GENITIVE = [
  "неділю",
  "понеділок",
  "вівторок",
  "середу",
  "четвер",
  "п'ятницю",
  "суботу",
];

export const WEEKDAYS_SHORT = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const MONTHS = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

/**
 * "YYYY-MM-DD" → Date у локальному часовому поясі (без зсуву, на відміну
 * від new Date(iso), який трактує рядок як UTC-опівніч).
 */
export const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** "у суботу, 15 серпня" — з ISO-рядка YYYY-MM-DD. */
export const prettyDay = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const date = parseISO(iso);
  return `у ${WEEKDAYS_GENITIVE[date.getDay()]}, ${date.getDate()} ${
    MONTHS[date.getMonth()]
  }`;
};

/** "15.08" — коротко, для чіпів швидкого вибору дня. */
export const shortDay = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;

export const toISO = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const today = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const timeToMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export interface TimeRange {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

/**
 * Чи перетинається проміжок [startHHMM, startHHMM + durationMin) з жодним
 * із зайнятих проміжків. durationMin — скільки в середньому триває
 * побачення, щоб не пропустити конфлікт, який почнеться посеред нього.
 */
export const overlapsAny = (
  startHHMM: string,
  durationMin: number,
  ranges: TimeRange[],
) => {
  const s = timeToMinutes(startHHMM);
  const e = s + durationMin;
  return ranges.some((r) => {
    const rs = timeToMinutes(r.start);
    const re = timeToMinutes(r.end);
    return s < re && e > rs;
  });
};

/** "19:00–21:00" */
export const formatRange = (r: TimeRange) => `${r.start}–${r.end}`;
