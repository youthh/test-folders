import React, { useMemo, useState } from "react";
import {
  busyDays,
  dateDurationMinutes,
  dateIdeas,
  timeSlots,
  workHours,
} from "./config";
import {
  addDays,
  effectiveBusyRanges,
  formatRange,
  generateTimeOptions,
  overlapsAny,
  parseISO,
  shortDay,
  toISO,
  today,
  WEEKDAYS_SHORT,
} from "./dateUtils";
import { DatePlan } from "./types";

interface Props {
  onSubmit: (plan: DatePlan) => void;
}

// Скільки днів наперед показати швидкими кнопками
const QUICK_DAYS = 14;
// Діапазон для випадного списку годин
const SELECT_TIMES = generateTimeOptions("08:00", "23:30", 30);

const BUSY_TITLE = "у цей день я вже зайнятий";
const timeBusyMessage = (day: string) =>
  `Ой, у цей час у мене вже є плани на ${day} 😅 обери інший`;

/** Форма: коли вільна, о котрій та яке побачення хочеться. */
const PlanForm: React.FC<Props> = ({ onSubmit }) => {
  const min = useMemo(() => toISO(today()), []);
  const quickDays = useMemo(
    () =>
      Array.from({ length: QUICK_DAYS }, (_, i) => {
        const date = addDays(today(), i);
        return {
          iso: toISO(date),
          weekday: WEEKDAYS_SHORT[date.getDay()],
          label: shortDay(date),
        };
      }),
    [],
  );

  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Проміжки, зайняті саме в обраний день: робочі години (якщо це робочий
  // день) + окремі події з config.busyDays. Якщо день ще не обрано — пусто.
  const dayRanges = day ? effectiveBusyRanges(day, busyDays, workHours) : [];
  const dayFullyBusy = day ? busyDays[day]?.allDay === true : false;

  const isTimeBusy = (t: string) =>
    dayRanges.length > 0 && overlapsAny(t, dateDurationMinutes, dayRanges);

  const clearTimeIfNowBusy = (ranges: typeof dayRanges) => {
    if (
      time &&
      ranges.length > 0 &&
      overlapsAny(time, dateDurationMinutes, ranges)
    ) {
      setTime("");
    }
  };

  const pickDay = (iso: string) => {
    if (busyDays[iso]?.allDay) return; // на всяк випадок, кнопка й так вимкнена
    setDay(iso);
    setError("");
    clearTimeIfNowBusy(effectiveBusyRanges(iso, busyDays, workHours));
  };

  const pickTime = (slot: string) => {
    if (isTimeBusy(slot)) return;
    setTime(slot);
    setError("");
  };

  const toggleIdea = (id: string) => {
    setIdeas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!day) return setError("Обери день 🗓️");
    if (busyDays[day]?.allDay)
      return setError("Ой, у цей день я вже зайнятий 😅 обери інший");
    if (!time) return setError("І час теж 🕒");
    if (isTimeBusy(time))
      return setError(timeBusyMessage(shortDay(parseISO(day))));
    if (ideas.length === 0)
      return setError("Обери хоч одну ідею для побачення 💫");
    onSubmit({ day, time, ideas, note: note.trim() });
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2 className="title small">Ура! 🎉</h2>
      <p className="subtitle">
        Тепер найважливіше: коли ти вільна і що робимо?
      </p>

      <div className="field">
        <span className="field-label">Який день тобі зручний?</span>
        <div className="chips days">
          {quickDays.map((d) => {
            const isBusy = busyDays[d.iso]?.allDay === true;
            return (
              <button
                key={d.iso}
                type="button"
                className={`chip day${day === d.iso ? " active" : ""}${
                  isBusy ? " busy" : ""
                }`}
                disabled={isBusy}
                title={isBusy ? BUSY_TITLE : undefined}
                onClick={() => pickDay(d.iso)}
              >
                <span className="day-weekday">{d.weekday}</span>
                <span className="day-date">{d.label}</span>
              </button>
            );
          })}
        </div>
        <span className="hint">
          закреслені дні — я зайнятий увесь день; або постав свою дату нижче
        </span>
        <input
          type="date"
          className="input"
          min={min}
          value={day}
          onChange={(e) => {
            const value = e.target.value;
            setDay(value);
            if (busyDays[value]?.allDay) {
              setError("Ой, у цей день я вже зайнятий 😅 обери інший");
            } else {
              setError("");
              clearTimeIfNowBusy(
                effectiveBusyRanges(value, busyDays, workHours),
              );
            }
          }}
        />
      </div>

      <div className="field">
        <span className="field-label">О котрій?</span>
        <div className="chips">
          {timeSlots.map((slot) => {
            const busy = isTimeBusy(slot);
            return (
              <button
                key={slot}
                type="button"
                className={`chip${time === slot ? " active" : ""}${
                  busy ? " busy" : ""
                }`}
                disabled={busy}
                title={busy ? "у цей час я вже зайнятий" : undefined}
                onClick={() => pickTime(slot)}
              >
                {slot}
              </button>
            );
          })}
        </div>

        {/* нормальний select замість голого input[type=time] — зайняті
            години видно прямо в списку, ще до того, як його відкрили */}
        <select
          className="input select-time"
          value={SELECT_TIMES.includes(time) ? time : ""}
          onChange={(e) => {
            const value = e.target.value;
            setTime(value);
            setError(
              value && isTimeBusy(value)
                ? "Ой, у цей час у мене вже є плани 😅 обери інший"
                : "",
            );
          }}
        >
          <option value="" disabled>
            — або обери інший час зі списку —
          </option>
          {SELECT_TIMES.map((t) => {
            const busy = isTimeBusy(t);
            return (
              <option key={t} value={t} disabled={busy}>
                {busy ? `${t} — зайнято` : t}
              </option>
            );
          })}
        </select>

        {!dayFullyBusy && dayRanges.length > 0 && (
          <span className="hint">
            закреслені години — {dayRanges.map(formatRange).join(", ")} у мене
            вже зайнято
          </span>
        )}
      </div>

      <div className="field">
        <span className="field-label">Яке побачення хочеш?</span>
        <div className="chips">
          {dateIdeas.map((idea) => (
            <button
              key={idea.id}
              type="button"
              className={`chip idea${ideas.includes(idea.id) ? " active" : ""}`}
              onClick={() => toggleIdea(idea.id)}
              aria-pressed={ideas.includes(idea.id)}
            >
              <span className="chip-emoji">{idea.emoji}</span>
              {idea.label}
            </button>
          ))}
        </div>
        <span className="hint">можна обрати кілька 😌</span>
      </div>

      <label className="field">
        <span className="field-label">Побажання / умови (необов'язково)</span>
        <textarea
          className="input textarea"
          rows={3}
          maxLength={400}
          placeholder="напр.: тільки без дощу, і щоб десерт був"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn btn-yes wide">
        Готово ✨
      </button>
    </form>
  );
};

export default PlanForm;
