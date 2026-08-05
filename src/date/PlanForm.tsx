import React, { useMemo, useState } from "react";
import { dateIdeas, timeSlots } from "./config";
import { DatePlan } from "./types";

interface Props {
  onSubmit: (plan: DatePlan) => void;
}

const todayISO = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
};

/** Форма: коли вільна, о котрій та яке побачення хочеться. */
const PlanForm: React.FC<Props> = ({ onSubmit }) => {
  const min = useMemo(todayISO, []);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const toggleIdea = (id: string) => {
    setIdeas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!day) return setError("Обери день 🗓️");
    if (!time) return setError("І час теж 🕒");
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

      <label className="field">
        <span className="field-label">Який день тобі зручний?</span>
        <input
          type="date"
          className="input"
          min={min}
          value={day}
          onChange={(e) => {
            setDay(e.target.value);
            setError("");
          }}
        />
      </label>

      <div className="field">
        <span className="field-label">О котрій?</span>
        <div className="chips">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`chip${time === slot ? " active" : ""}`}
              onClick={() => {
                setTime(slot);
                setError("");
              }}
            >
              {slot}
            </button>
          ))}
        </div>
        <input
          type="time"
          className="input"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            setError("");
          }}
          aria-label="Свій варіант часу"
        />
        <span className="hint">або постав свій час</span>
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
