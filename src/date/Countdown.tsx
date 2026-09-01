import React, { useEffect, useState } from "react";
import { formatDuration, toDateTime } from "./dateUtils";

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

  return (
    <p className="countdown">
      залишилось <strong>{formatDuration(diffMs)}</strong> ⏳
    </p>
  );
};

export default Countdown;
