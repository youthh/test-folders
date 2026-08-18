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

/** "YYYY-MM-DD" + "HH:MM" → Date у локальному часовому поясі. */
export const toDateTime = (iso: string, hhmm: string) => {
  const date = parseISO(iso);
  const [h, m] = hhmm.split(":").map(Number);
  date.setHours(h || 0, m || 0, 0, 0);
  return date;
};

/** "3 дні" / "2 години" / "5 хвилин" — українська множина за числом. */
export const pluralize = (
  n: number,
  [one, few, many]: [string, string, string],
) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
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

/** "HH:MM" зі зсувом на +/- хвилин, обрізаний до меж доби. */
export const addMinutesToTime = (hhmm: string, minutes: number) => {
  const total = Math.min(
    Math.max(timeToMinutes(hhmm) + minutes, 0),
    23 * 60 + 59,
  );
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Об'єднує проміжки, що перетинаються або дотикаються, в один список. */
export const mergeRanges = (ranges: TimeRange[]): TimeRange[] => {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );
  const merged: TimeRange[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i += 1) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (timeToMinutes(cur.start) <= timeToMinutes(last.end)) {
      if (timeToMinutes(cur.end) > timeToMinutes(last.end)) last.end = cur.end;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
};

/** Регулярний робочий графік із буфером до й після нього. */
export interface WorkHours {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  bufferMinutes: number;
  weekdays: number[]; // як у Date.getDay(): 0 — нд, 1 — пн, ... 6 — сб
}

export interface BusyDayInfo {
  allDay?: boolean;
  ranges?: TimeRange[];
}

export type BusyDaysMap = Record<string, BusyDayInfo>;

/**
 * Усі зайняті проміжки в конкретний день: робочі години з буфером (якщо
 * цей день узагалі робочий) плюс окремі події з busyDays — об'єднані й
 * посортовані.
 */
export const effectiveBusyRanges = (
  iso: string,
  busyDays: BusyDaysMap,
  workHours: WorkHours,
): TimeRange[] => {
  const weekday = parseISO(iso).getDay();
  const ranges: TimeRange[] = [];

  if (workHours.weekdays.includes(weekday)) {
    ranges.push({
      start: addMinutesToTime(workHours.start, -workHours.bufferMinutes),
      end: addMinutesToTime(workHours.end, workHours.bufferMinutes),
    });
  }

  ranges.push(...(busyDays[iso]?.ranges ?? []));

  return mergeRanges(ranges);
};

/** Список "HH:MM" від startHHMM до endHHMM (включно) із кроком stepMinutes. */
export const generateTimeOptions = (
  startHHMM: string,
  endHHMM: string,
  stepMinutes: number,
) => {
  const start = timeToMinutes(startHHMM);
  const end = timeToMinutes(endHHMM);
  const options: string[] = [];
  for (let t = start; t <= end; t += stepMinutes) {
    options.push(
      `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(
        2,
        "0",
      )}`,
    );
  }
  return options;
};
