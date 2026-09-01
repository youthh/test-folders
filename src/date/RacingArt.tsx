import React from "react";

/**
 * Декоративні SVG для гоночної теми — керма й силует машини. Обидва
 * намальовані вручну простими формами (без зовнішніх картинок), контур
 * неоновим градієнтом, щоб пасувати темному фону.
 */

let gradientId = 0;
const nextId = (prefix: string) => `${prefix}-${(gradientId += 1)}`;

export const SteeringWheel: React.FC<{ className?: string }> = ({
  className,
}) => {
  const id = nextId("wheel-grad");
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2e88" />
          <stop offset="100%" stopColor="#22e0ff" />
        </linearGradient>
      </defs>
      {/* обід */}
      <circle
        cx="100"
        cy="100"
        r="82"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="13"
      />
      {/* три спиці */}
      <g stroke={`url(#${id})`} strokeWidth="13" strokeLinecap="round">
        <line x1="100" y1="80" x2="100" y2="24" />
        <line x1="118" y1="112" x2="164" y2="139" />
        <line x1="82" y1="112" x2="36" y2="139" />
      </g>
      {/* маточина */}
      <circle
        cx="100"
        cy="100"
        r="24"
        fill="#150a24"
        stroke={`url(#${id})`}
        strokeWidth="6"
      />
    </svg>
  );
};

export const CarSilhouette: React.FC<{ className?: string }> = ({
  className,
}) => {
  const id = nextId("car-grad");
  return (
    <svg
      viewBox="0 0 420 170"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22e0ff" />
          <stop offset="100%" stopColor="#ff2e88" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="4">
        {/* заднє антикрило */}
        <rect x="16" y="34" width="46" height="9" rx="3" />
        <line x1="40" y1="43" x2="40" y2="72" />
        {/* корпус */}
        <rect x="60" y="70" width="280" height="46" rx="23" />
        {/* кабіна */}
        <rect x="150" y="44" width="110" height="34" rx="16" />
        {/* ніс */}
        <rect x="330" y="82" width="52" height="22" rx="11" />
        {/* підніжка між колесами */}
        <rect x="92" y="112" width="200" height="7" rx="3" />
      </g>
      {/* колеса */}
      <g fill="#150a24" stroke={`url(#${id})`} strokeWidth="4">
        <circle cx="112" cy="118" r="30" />
        <circle cx="308" cy="118" r="30" />
      </g>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="3">
        <circle cx="112" cy="118" r="12" />
        <circle cx="308" cy="118" r="12" />
      </g>
    </svg>
  );
};
