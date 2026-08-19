import React, { useCallback, useEffect, useRef, useState } from "react";
import { maxDodges, noLabels } from "./config";

type Point = { x: number; y: number };

interface Props {
  dodges: number;
  onDodge: () => void;
  /** Майданчик, у межах якого кнопці дозволено тікати. */
  arenaRef: React.RefObject<HTMLElement>;
  /**
   * Поки true — кнопка не реагує на рух миші по вікну. Потрібно, коли
   * картка ще прихована (наприклад під фольгою скретч-картки): без цього
   * мишача "чуйка" ловить рухи миші деінде на екрані й кнопка встигає
   * втекти назавжди ще до того, як її взагалі побачили.
   */
  paused?: boolean;
}

// Відстань (px), на якій кнопка вже починає тікати від курсора
const FLEE_RADIUS = 90;
// Мінімальний відступ від країв екрана
const EDGE = 8;
// Запас на нахил кнопки при розрахунку її габариту
const SAFETY = 10;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Кнопка «ні», яку неможливо натиснути.
 *
 * Тікає вона лише в межах майданчика (arenaRef) — тобто завжди лишається
 * там, куди людина дивиться, і не може загубитись десь за краєм екрана.
 *
 * Десктоп: слухаємо рух миші по вікну — щойно курсор підповзає ближче за
 * FLEE_RADIUS, кнопка перестрибує в найдальшу від нього точку майданчика.
 *
 * Телефон: там немає ховера, тому працюють два запобіжники —
 *   1) на pointerdown/touchstart кнопка стрибає ще до того, як палець відпустили;
 *   2) навіть якщо клік таки зареєструвався, onClick не приймає відповідь,
 *      а просто змушує кнопку тікати далі.
 * Плюс з кожною спробою вона меншає, тож влучити стає дедалі важче.
 */
const RunawayNo: React.FC<Props> = ({
  dodges,
  onDodge,
  arenaRef,
  paused = false,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<Point | null>(null);
  const posRef = useRef<Point | null>(null);
  const lastDodgeAt = useRef(0);

  /**
   * Межі, у яких може опинитись лівий верхній кут кнопки.
   * Це перетин майданчика з видимою частиною вікна — тож кнопка не вилізе
   * ні за картку, ні за екран (навіть коли сайт відкрито у вбудованій рамці).
   */
  const bounds = useCallback(() => {
    const arena = arenaRef.current;
    const el = ref.current;
    if (!arena || !el) return null;

    const a = arena.getBoundingClientRect();
    // розмір без трансформацій + запас: інакше нахил кнопки на наступному
    // кроці розширює її габарит і вона визирає за межі майданчика
    const b = {
      width: el.offsetWidth + SAFETY,
      height: el.offsetHeight + SAFETY,
    };

    // видима частина майданчика у координатах вікна
    const left = Math.max(a.left, EDGE);
    const top = Math.max(a.top, EDGE);
    const right = Math.min(a.right, window.innerWidth - EDGE);
    const bottom = Math.min(a.bottom, window.innerHeight - EDGE);

    // переводимо у координати всередині майданчика
    let minX = left - a.left;
    let minY = top - a.top;
    let maxX = right - a.left - b.width;
    let maxY = bottom - a.top - b.height;

    // якщо майданчик майже не видно — лишаємось хоча б у його межах
    if (maxX < minX) {
      minX = 0;
      maxX = Math.max(0, a.width - b.width);
    }
    if (maxY < minY) {
      minY = 0;
      maxY = Math.max(0, a.height - b.height);
    }

    return { minX, minY, maxX, maxY, width: b.width, height: b.height };
  }, [arenaRef]);

  const jump = useCallback(
    (away?: Point) => {
      const arena = arenaRef.current;
      const box = bounds();
      if (!arena || !box) return;

      const now = Date.now();
      // не даємо кнопці смикатись по 60 разів на секунду
      if (now - lastDodgeAt.current < 110) return;
      lastDodgeAt.current = now;

      const a = arena.getBoundingClientRect();
      const current = posRef.current;

      // Кидаємо кілька варіантів і беремо найдальший від пальця/курсора
      let best: Point | null = null;
      let bestScore = -Infinity;

      for (let i = 0; i < 16; i += 1) {
        const candidate: Point = {
          x: randomBetween(box.minX, box.maxX),
          y: randomBetween(box.minY, box.maxY),
        };
        // центр кандидата в координатах вікна
        const cx = a.left + candidate.x + box.width / 2;
        const cy = a.top + candidate.y + box.height / 2;

        const fromPointer = away ? Math.hypot(cx - away.x, cy - away.y) : 500;
        const fromCurrent = current
          ? Math.hypot(candidate.x - current.x, candidate.y - current.y)
          : 500;

        // головне — подалі від курсора, але й не на тому самому місці
        const score = fromPointer + Math.min(fromCurrent, 160) * 0.6;
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }

      if (!best) return;
      posRef.current = best;
      setPos(best);
      onDodge();
    },
    [arenaRef, bounds, onDodge],
  );

  // Десктоп: тікаємо від курсора
  useEffect(() => {
    if (paused) return;
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
  }, [jump, paused]);

  // Змінився розмір вікна або сторінку прокрутили — повертаємо кнопку у видимі межі
  useEffect(() => {
    const reclamp = () => {
      const current = posRef.current;
      const box = bounds();
      if (!current || !box) return;
      const next: Point = {
        x: clamp(current.x, box.minX, Math.max(box.minX, box.maxX)),
        y: clamp(current.y, box.minY, Math.max(box.minY, box.maxY)),
      };
      if (next.x !== current.x || next.y !== current.y) {
        posRef.current = next;
        setPos(next);
      }
    };

    window.addEventListener("resize", reclamp);
    window.addEventListener("scroll", reclamp, { passive: true });
    return () => {
      window.removeEventListener("resize", reclamp);
      window.removeEventListener("scroll", reclamp);
    };
  }, [bounds]);

  if (dodges > maxDodges) {
    // Кнопка втекла назавжди
    return <p className="gone-note">кнопка «ні» втекла з сайту 🏃‍♀️💨</p>;
  }

  const scale = Math.max(0.55, 1 - dodges * 0.05);
  const label = noLabels[Math.min(dodges, noLabels.length - 1)];

  const style: React.CSSProperties = pos
    ? {
        position: "absolute",
        left: pos.x,
        top: pos.y,
        margin: 0,
        transform: `scale(${scale}) rotate(${
          (dodges % 2 ? -1 : 1) * dodges * 2
        }deg)`,
        zIndex: 3,
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
