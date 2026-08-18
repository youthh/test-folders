import React, { useState } from "react";
import { config, dateIdeas } from "./config";
import { prettyDay } from "./dateUtils";
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

/** Фінальна картка з підсумком побачення. */
const Done: React.FC<Props> = ({ plan, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const labels = ideaLabels(plan.ideas);

  const text = [
    "Побачення підтверджено 💌",
    `Коли: ${prettyDay(plan.day)} о ${plan.time}`,
    `Що робимо: ${labels.join(", ")}`,
    plan.note ? `Побажання: ${plan.note}` : "",
    config.myName ? `Чекаю 🤍 ${config.myName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Наше побачення 💌", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // користувач скасував шаринг — нічого не робимо
    }
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

      <p className="subtitle">
        Надішли це мені — і вважай, що ми домовились 🤍
      </p>

      <div className="done-actions">
        <button type="button" className="btn btn-yes" onClick={share}>
          {copied ? "Скопійовано ✅" : "Надіслати / скопіювати"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          Змінити
        </button>
      </div>
    </div>
  );
};

export default Done;
