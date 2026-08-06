import React, { useRef, useState } from "react";
import Confetti from "./Confetti";
import Done from "./Done";
import Hearts from "./Hearts";
import PlanForm from "./PlanForm";
import RunawayNo from "./RunawayNo";
import { config, maxDodges } from "./config";
import { DatePlan } from "./types";
import "./date.css";

type Step = "ask" | "form" | "done";

const teases = [
  "",
  "серйозно? 🙃",
  "кнопка «ні» сьогодні не працює",
  "вона тебе боїться",
  "може все ж «так»? ☕",
  "ти вперта, мені подобається",
  "«так» ось тут, зовсім поруч 💗",
  "остання спроба, і вона втече",
];

const DateInvite: React.FC = () => {
  const [step, setStep] = useState<Step>("ask");
  const [dodges, setDodges] = useState(0);
  const [plan, setPlan] = useState<DatePlan | null>(null);
  // майданчик, за межі якого кнопка «ні» не може втекти
  const arenaRef = useRef<HTMLDivElement>(null);

  const yesScale = Math.min(1 + dodges * 0.06, 1.45);
  const tease = teases[Math.min(dodges, teases.length - 1)];

  return (
    <div className="date-app">
      <Hearts />
      <Confetti fire={step !== "ask"} />

      <main className="stage">
        {step === "ask" && (
          <div className="card ask">
            <div className="emoji-big">☕💗</div>
            <h1 className="title">
              {config.herName ? `${config.herName}, ` : ""}
              {config.question}
            </h1>
            <p className="subtitle">{config.subtitle}</p>

            <div
              className={`buttons${dodges > maxDodges ? " collapsed" : ""}`}
              ref={arenaRef}
            >
              <button
                type="button"
                className="btn btn-yes"
                style={{ transform: `scale(${yesScale})` }}
                onClick={() => setStep("form")}
              >
                Так 💖
              </button>
              <RunawayNo
                dodges={dodges}
                onDodge={() => setDodges((d) => d + 1)}
                arenaRef={arenaRef}
              />
            </div>

            {dodges > maxDodges ? (
              <p className="tease">лишилась одна кнопка. доля 😌</p>
            ) : (
              tease && <p className="tease">{tease}</p>
            )}
          </div>
        )}

        {step === "form" && (
          <PlanForm
            onSubmit={(p) => {
              setPlan(p);
              setStep("done");
            }}
          />
        )}

        {step === "done" && plan && (
          <Done plan={plan} onEdit={() => setStep("form")} />
        )}
      </main>
    </div>
  );
};

export default DateInvite;
