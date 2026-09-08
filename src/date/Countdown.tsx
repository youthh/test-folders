import React, { useEffect, useState } from "react";
import { pluralize, toDateTime } from "./dateUtils";

interface Props {
  day: string;
  time: string;
}

/** Живий зворотний відлік до дня й часу побачення. */
const Countdown: React.FC<Props> = ({ day, time }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const diffMs = toDateTime(day, time).getTime() - now.getTime();
  if (diffMs <= 0) {
    return <p className="countdown">цей момент уже настав 🥳</p>;
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0)
    parts.push(`${days} ${pluralize(days, ["день", "дні", "днів"])}`);
  if (days > 0 || hours > 0)
    parts.push(`${hours} ${pluralize(hours, ["година", "години", "годин"])}`);
  if (days === 0)
    parts.push(
      `${minutes} ${pluralize(minutes, ["хвилина", "хвилини", "хвилин"])}`,
    );

  return (
    <p className="countdown">
      залишилось <strong>{parts.join(" ")}</strong> ⏳
    </p>
  );
};

export default Countdown;
