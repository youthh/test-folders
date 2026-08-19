import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  /** Поки true — зверху лежить шар "фольги", який треба стерти. */
  active: boolean;
  onReveal: () => void;
  children: React.ReactNode;
}

// Частка стертої поверхні, після якої решта відкривається сама
const REVEAL_THRESHOLD = 0.55;
const BRUSH_RADIUS = 34;
// Крок семплювання пікселів при підрахунку % стертого (для швидкодії —
// перевіряти геть кожен піксель на кожному відпусканні пальця немає сенсу)
const SAMPLE_STRIDE = 6;

/**
 * Скретч-картка: перш ніж показати вміст, зверху лежить непрозорий шар
 * "фольги", який стирається пальцем/мишкою (canvas + destination-out),
 * як у лотерейного квитка. Коли стерто достатньо — решта плавно
 * відкривається сама.
 */
const ScratchCard: React.FC<Props> = ({ active, onReveal, children }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const scratching = useRef(false);
  const revealedRef = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // стежимо за розміром обгортки (текст усередині картки може займати
  // різну висоту на різних екранах)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !active) return;
    const measure = () =>
      setSize({
        w: Math.round(el.clientWidth),
        h: Math.round(el.clientHeight),
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  // малюємо "фольгу" щоразу, як міняється розмір (поки ще не розкрито)
  useEffect(() => {
    if (!active || revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const grad = ctx.createLinearGradient(0, 0, size.w, size.h);
    grad.addColorStop(0, "#e7dcf0");
    grad.addColorStop(0.5, "#f4e3ef");
    grad.addColorStop(1, "#dcd0ea");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size.w, size.h);

    // діагональні смужки — ефект фольги
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 10;
    for (let x = -size.h; x < size.w; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size.h, size.h);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(122,92,108,0.75)";
    ctx.font = "34px sans-serif";
    ctx.fillText("🎟️", size.w / 2, size.h / 2 - 8);
    ctx.font = "700 16px Nunito, sans-serif";
    ctx.fillText("проведи пальцем, щоб дізнатись", size.w / 2, size.h / 2 + 26);
  }, [active, size]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const eraseTo = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.beginPath();
    const from = lastPoint.current ?? { x, y };
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPoint.current = { x, y };
  };

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setFadingOut(true);
    setTimeout(onReveal, 450); // дочекатись css-переходу
  }, [onReveal]);

  const checkRevealed = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) return;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * SAMPLE_STRIDE) {
      total += 1;
      if (data[i] < 40) transparent += 1;
    }
    if (total > 0 && transparent / total >= REVEAL_THRESHOLD) reveal();
  }, [reveal]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratching.current = true;
    const p = getPoint(e);
    lastPoint.current = p;
    eraseTo(p.x, p.y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active || !scratching.current) return;
    const p = getPoint(e);
    eraseTo(p.x, p.y);
  };

  const onPointerUp = () => {
    if (!active) return;
    scratching.current = false;
    lastPoint.current = null;
    checkRevealed();
  };

  if (!active) return <>{children}</>;

  return (
    <div className="scratch-outer">
      <div className="scratch-wrap" ref={wrapRef}>
        {children}
        <canvas
          ref={canvasRef}
          className={`scratch-canvas${fadingOut ? " fading" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      {!fadingOut && (
        <button type="button" className="scratch-skip" onClick={reveal}>
          не хочеться шкребти? тисни тут
        </button>
      )}
    </div>
  );
};

export default ScratchCard;
