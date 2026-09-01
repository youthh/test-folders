import React, { useEffect, useMemo, useRef, useState } from "react";
import Confetti from "./Confetti";
import Done from "./Done";
import Hearts from "./Hearts";
import MusicToggle from "./MusicToggle";
import PlanForm from "./PlanForm";
import Reasons from "./Reasons";
import RunawayNo from "./RunawayNo";
import ScratchCard from "./ScratchCard";
import {
  activity,
  config,
  maxDodges,
  offerStartsAt,
  offerValidHours,
} from "./config";
import { formatDuration } from "./dateUtils";
import { DatePlan } from "./types";
import "./date.css";

type Step = "ask" | "form" | "done";

// Фонові емодзі: більше гоночних, трохи сердечок, щоб не втрачати вайб
// побачення
const BACKGROUND_EMOJIS = ["🏎️", "🏎️", "🏁", "💨", "✨", "💗"];

const teases = [
  "",
  "серйозно? 🙃",
  "кнопка «ні» сьогодні не працює",
  "вона тебе боїться",
  "може все ж «так»? 🏎️",
  "ти вперта, мені подобається",
  "«так» ось тут, зовсім поруч 💗",
  "остання спроба, і вона втече",
];

const DateInvite: React.FC = () => {
  const [step, setStep] = useState<Step>("ask");
  const [dodges, setDodges] = useState(0);
  const [plan, setPlan] = useState<DatePlan | null>(null);
  // поки false — питання сховане під шаром "фольги" скретч-картки
  const [revealed, setRevealed] = useState(false);
  // майданчик, за межі якого кнопка «ні» не може втекти
  const arenaRef = useRef<HTMLDivElement>(null);

  // "YYYY-MM-DDTHH:MM:SS" без часового поясу ECMAScript трактує як
  // локальний час (на відміну від дато-форми "YYYY-MM-DD", яка йде як
  // UTC-опівніч) — тому new Date(offerStartsAt) тут безпечний.
  const deadline = useMemo(
    () =>
      new Date(new Date(offerStartsAt).getTime() + offerValidHours * 3600000),
    [],
  );
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const msLeft = deadline.getTime() - now.getTime();
  const expired = msLeft <= 0;

  const yesScale = Math.min(1 + dodges * 0.06, 1.45);
  const tease = teases[Math.min(dodges, teases.length - 1)];

  return (
    <div className="date-app">
      <Hearts emojis={BACKGROUND_EMOJIS} />
      <Confetti fire={step !== "ask"} />
      <MusicToggle />

      <main className="stage">
        {step === "ask" &&
          (expired ? (
            <div className="card ask expired">
              <div className="emoji-big">⏰</div>
              <h1 className="title">Час вийшов…</h1>
              <p className="subtitle">
                Ця пропозиція вже неактуальна — але якщо ти все ще хочеш, просто
                напиши мені 😉
              </p>
            </div>
          ) : (
            <div className="ask-page">
              <p className="offer-timer">
                ⏳ пропозиція дійсна ще {formatDuration(msLeft)}
              </p>
              <ScratchCard
                active={!revealed}
                onReveal={() => setRevealed(true)}
              >
                <div className="card ask">
                  {config.intro && <p className="intro">{config.intro}</p>}
                  <div className="emoji-big">{activity.emoji}💗</div>
                  <h1 className="title">
                    {config.herName ? `${config.herName}, ` : ""}
                    {config.question}
                  </h1>
                  <p className="subtitle">{config.subtitle}</p>
                  <Reasons />

                  <div
                    className={`buttons${
                      dodges > maxDodges ? " collapsed" : ""
                    }`}
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
                      paused={!revealed}
                    />
                  </div>

                  {dodges > maxDodges ? (
                    <p className="tease">лишилась одна кнопка. доля 😌</p>
                  ) : (
                    tease && <p className="tease">{tease}</p>
                  )}
                </div>
              </ScratchCard>
            </div>
          ))}

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
