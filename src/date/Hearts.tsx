import React, { useMemo } from "react";

const EMOJIS = ["💗", "💖", "✨", "💘", "🌸", "💞", "☕", "🫶"];

/** Фонові сердечка, які повільно летять вгору. */
const Hearts: React.FC<{ count?: number }> = ({ count = 18 }) => {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 12 + Math.random() * 12,
        size: 14 + Math.random() * 26,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      })),
    [count],
  );

  return (
    <div className="hearts" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.id}
          className="heart"
          style={{
            left: `${it.left}%`,
            fontSize: `${it.size}px`,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
};

export default Hearts;
