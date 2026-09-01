import React, { useState } from "react";
import { reasons } from "./config";

/** Розкривний список причин «чому саме зі мною». */
const Reasons: React.FC = () => {
  const [open, setOpen] = useState(false);

  if (reasons.length === 0) return null;

  return (
    <div className="reasons-block">
      <button
        type="button"
        className="reasons-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "сховати ↑" : "чому саме зі мною? 👉"}
      </button>

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
