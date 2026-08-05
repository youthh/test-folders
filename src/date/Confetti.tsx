import React, { useEffect, useRef } from "react";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  heart: boolean;
}

const COLORS = ["#ff5d8f", "#ff8fab", "#ffd166", "#a06cd5", "#7bdff2", "#fff"];

/** Одноразовий салют конфеті на canvas — без сторонніх бібліотек. */
const Confetti: React.FC<{ fire: boolean; pieces?: number }> = ({
  fire,
  pieces = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const items: Piece[] = Array.from({ length: pieces }, () => ({
      x: w() / 2 + (Math.random() - 0.5) * w() * 0.5,
      y: h() * 0.45 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 11,
      vy: -6 - Math.random() * 11,
      size: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      heart: Math.random() < 0.25,
    }));

    let raf = 0;
    const started = Date.now();

    const drawHeart = (size: number) => {
      const s = size / 10;
      ctx.beginPath();
      ctx.moveTo(0, 3 * s);
      ctx.bezierCurveTo(0, 1 * s, -5 * s, -2 * s, -5 * s, -3.5 * s);
      ctx.bezierCurveTo(-5 * s, -7 * s, 0, -6.5 * s, 0, -3 * s);
      ctx.bezierCurveTo(0, -6.5 * s, 5 * s, -7 * s, 5 * s, -3.5 * s);
      ctx.bezierCurveTo(5 * s, -2 * s, 0, 1 * s, 0, 3 * s);
      ctx.fill();
    };

    const tick = () => {
      const elapsed = Date.now() - started;
      ctx.clearRect(0, 0, w(), h());

      items.forEach((p) => {
        p.vy += 0.24; // гравітація
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 4200);
        ctx.fillStyle = p.color;
        if (p.heart) {
          drawHeart(p.size * 1.6);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });

      if (elapsed < 4200) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w(), h());
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [fire, pieces]);

  if (!fire) return null;
  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
};

export default Confetti;
