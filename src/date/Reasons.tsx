import React, { useState } from "react";
import Confetti from "./Confetti";
import { reasons } from "./config";
import { pickNextReason } from "./randomReason";

/** Розкривний список причин «чому саме кава зі мною». */
const Reasons: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState<number[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  // кожен новий кидок міняє key, тож конфеті й анімація стартують заново
  const [burst, setBurst] = useState(0);

  if (reasons.length === 0) return null;

  const rollReason = () => {
    const next = pickNextReason(reasons.length, used);
    setUsed(next.used);
    setCurrent(reasons[next.index]);
    setBurst((b) => b + 1);
  };

  return (
    <div className="reasons-block">
      <div className="reasons-actions">
        <button type="button" className="reasons-toggle" onClick={rollReason}>
          {current === null ? "випадкова причина 🎲" : "ще одну 🎲"}
        </button>
        <button
          type="button"
          className="reasons-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? "сховати ↑" : "чому саме кава зі мною? 👉"}
        </button>
      </div>

      {current !== null && (
        <p key={burst} className="reason-random" aria-live="polite">
          {current}
          <span className="reason-counter">
            {used.length} з {reasons.length}
          </span>
        </p>
      )}
      <Confetti key={burst} fire={burst > 0} pieces={50} />

      {open && (
        <ul className="reasons-list">
          {reasons.map((reason, i) => (
            <li
              key={reason}
              className="reason-card"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reasons;
