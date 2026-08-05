import React, { useCallback, useEffect, useRef, useState } from "react";
import { maxDodges, noLabels } from "./config";

type Point = { x: number; y: number };

interface Props {
  dodges: number;
  onDodge: () => void;
}

// Відстань (px), на якій кнопка вже починає тікати від курсора
const FLEE_RADIUS = 110;
// Мінімальний відступ від країв екрана
const EDGE = 12;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

/**
 * Кнопка «ні», яку неможливо натиснути.
 *
 * Десктоп: слухаємо рух миші по вікну — щойно курсор підповзає ближче за
 * FLEE_RADIUS, кнопка телепортується в інше місце.
 *
 * Телефон: там немає ховера, тому працюють два запобіжники —
 *   1) на pointerdown/touchstart кнопка стрибає ще до того, як палець відпустили;
 *   2) навіть якщо клік таки зареєструвався, onClick не приймає відповідь,
 *      а просто змушує кнопку тікати далі.
 * Плюс з кожною спробою вона меншає, тож влучити стає дедалі важче.
 */
const RunawayNo: React.FC<Props> = ({ dodges, onDodge }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<Point | null>(null);
  const posRef = useRef<Point | null>(null);
  const lastDodgeAt = useRef(0);

  const jump = useCallback(
    (away?: Point) => {
      const el = ref.current;
      if (!el) return;

      const now = Date.now();
      // не даємо кнопці смикатись по 60 разів на секунду
      if (now - lastDodgeAt.current < 120) return;
      lastDodgeAt.current = now;

      const rect = el.getBoundingClientRect();
      const maxX = Math.max(EDGE, window.innerWidth - rect.width - EDGE);
      const maxY = Math.max(EDGE, window.innerHeight - rect.height - EDGE);

      let next: Point = {
        x: randomBetween(EDGE, maxX),
        y: randomBetween(EDGE, maxY),
      };

      // Шукаємо точку подалі від курсора/пальця та від поточного місця
      for (let i = 0; i < 24; i += 1) {
        const candidate: Point = {
          x: randomBetween(EDGE, maxX),
          y: randomBetween(EDGE, maxY),
        };
        const cx = candidate.x + rect.width / 2;
        const cy = candidate.y + rect.height / 2;
        const fromPointer = away
          ? Math.hypot(cx - away.x, cy - away.y)
          : Number.POSITIVE_INFINITY;
        const fromCurrent = Math.hypot(
          cx - (rect.left + rect.width / 2),
          cy - (rect.top + rect.height / 2),
        );

        if (fromPointer > 180 && fromCurrent > 140) {
          next = candidate;
          break;
        }
        next = candidate;
      }

      posRef.current = next;
      setPos(next);
      onDodge();
    },
    [onDodge],
  );

  // Десктоп: тікаємо від курсора
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      if (Math.hypot(dx, dy) < FLEE_RADIUS) {
        jump({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [jump]);

  // Якщо змінився розмір вікна — повертаємо кнопку в межі екрана
  useEffect(() => {
    const onResize = () => {
      const el = ref.current;
      const current = posRef.current;
      if (!el || !current) return;
      const rect = el.getBoundingClientRect();
      const next: Point = {
        x: Math.min(
          current.x,
          Math.max(EDGE, window.innerWidth - rect.width - EDGE),
        ),
        y: Math.min(
          current.y,
          Math.max(EDGE, window.innerHeight - rect.height - EDGE),
        ),
      };
      posRef.current = next;
      setPos(next);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (dodges > maxDodges) {
    // Кнопка втекла назавжди
    return <p className="gone-note">кнопка «ні» втекла з сайту 🏃‍♀️💨</p>;
  }

  const scale = Math.max(0.45, 1 - dodges * 0.07);
  const label = noLabels[Math.min(dodges, noLabels.length - 1)];

  const style: React.CSSProperties = pos
    ? {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: `scale(${scale}) rotate(${
          (dodges % 2 ? -1 : 1) * dodges * 2
        }deg)`,
        zIndex: 30,
      }
    : { transform: `scale(${scale})` };

  return (
    <button
      ref={ref}
      type="button"
      className="btn btn-no"
      style={style}
      // на телефоні стрибаємо ще до того, як палець відпустили
      onPointerDown={(e) => {
        e.preventDefault();
        jump({ x: e.clientX, y: e.clientY });
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        jump(touch ? { x: touch.clientX, y: touch.clientY } : undefined);
      }}
      onMouseEnter={(e) => jump({ x: e.clientX, y: e.clientY })}
      onFocus={() => jump()}
      // навіть якщо клік якимось дивом пройшов — відповідь не приймається
      onClick={(e) => {
        e.preventDefault();
        jump();
      }}
    >
      {label}
    </button>
  );
};

export default RunawayNo;
