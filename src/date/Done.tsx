import React, { useRef, useState } from "react";
import Countdown from "./Countdown";
import { config, dateIdeas, placeIdeas } from "./config";
import { prettyDay } from "./dateUtils";
import { buildGoogleCalendarUrl, downloadICS } from "./ics";
import { DatePlan } from "./types";

interface Props {
  plan: DatePlan;
  onEdit: () => void;
}

const ideaLabels = (ids: string[]) =>
  ids
    .map((id) => {
      const idea = dateIdeas.find((x) => x.id === id);
      return idea ? `${idea.emoji} ${idea.label}` : null;
    })
    .filter(Boolean) as string[];

/** Місця під обрані ідеї побачення, зібрані з config.placeIdeas. */
const places = (ids: string[]) => ids.flatMap((id) => placeIdeas[id] ?? []);

/** Фінальна картка з підсумком побачення. */
const Done: React.FC<Props> = ({ plan, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const labels = ideaLabels(plan.ideas);
  const suggestedPlaces = places(plan.ideas);

  const text = [
    "Побачення підтверджено 💌",
    `Коли: ${prettyDay(plan.day)} о ${plan.time}`,
    `Що робимо: ${labels.join(", ")}`,
    plan.note ? `Побажання: ${plan.note}` : "",
    config.myName ? `Чекаю 🤍 ${config.myName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  /**
   * Три рівні запасних варіантів: Web Share API → буфер обміну →
   * виділений текст на екрані. Останній варіант спрацює завжди, бо не
   * залежить від жодного дозволу браузера — деякі пісочниці (як прев'ю
   * цього ж сайту) блокують і share, і clipboard.
   */
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Наше побачення 💌", text });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // інакше (наприклад заборонено пісочницею) — пробуємо далі
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {
        // немає дозволу на буфер обміну — показуємо текст вручну нижче
      }
    }

    setShowFallback(true);
    requestAnimationFrame(() => {
      fallbackRef.current?.focus();
      fallbackRef.current?.select();
    });
  };

  return (
    <div className="card done">
      <div className="ticket-top">
        <span className="ticket-label">квиток на побачення</span>
        <span className="ticket-heart">💌</span>
      </div>

      <h2 className="title small">
        {config.herName ? `${config.herName}, це побачення!` : "Це побачення!"}
      </h2>

      <Countdown day={plan.day} time={plan.time} />

      <div className="summary">
        <div className="summary-row">
          <span className="summary-key">Коли</span>
          <span className="summary-value">{prettyDay(plan.day)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">О котрій</span>
          <span className="summary-value">{plan.time}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Що робимо</span>
          <span className="summary-value">{labels.join(" · ")}</span>
        </div>
        {plan.note && (
          <div className="summary-row">
            <span className="summary-key">Побажання</span>
            <span className="summary-value">{plan.note}</span>
          </div>
        )}
      </div>

      {suggestedPlaces.length > 0 && (
        <div className="places">
          <span className="field-label">Куди підемо</span>
          <ul className="places-list">
            {suggestedPlaces.map((place) => (
              <li key={place.name}>
                <a href={place.mapUrl} target="_blank" rel="noreferrer">
                  📍 {place.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="subtitle">
        Надішли це мені — і вважай, що ми домовились 🤍
      </p>

      {showFallback && (
        <div className="fallback-copy">
          <span className="hint">
            не вдалось скопіювати автоматично — текст уже виділений, просто
            натисни Ctrl/Cmd + C
          </span>
          <textarea
            ref={fallbackRef}
            className="input textarea"
            readOnly
            value={text}
            rows={5}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}

      <div className="done-actions">
        <button type="button" className="btn btn-yes" onClick={share}>
          {copied ? "Скопійовано ✅" : "Надіслати / скопіювати"}
        </button>
        <a
          href={buildGoogleCalendarUrl(plan)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          Google Calendar 📅
        </a>
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          Змінити
        </button>
      </div>

      <button
        type="button"
        className="ics-link"
        onClick={() => downloadICS(plan)}
      >
        або завантажити .ics-файл (Apple Calendar тощо)
      </button>
    </div>
  );
};

export default Done;
