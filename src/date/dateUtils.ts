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

/** "у суботу, 15 серпня" — з ISO-рядка YYYY-MM-DD. */
export const prettyDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `у ${WEEKDAYS_GENITIVE[date.getDay()]}, ${d} ${MONTHS[m - 1]}`;
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
