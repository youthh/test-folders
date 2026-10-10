import QRCode from "qrcode";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  // Дані, які зашиваємо в QR (посилання на подію в Google Calendar)
  value: string;
}

/**
 * QR-код на квитку — як справжній штрих-код на посадковому талоні. Скан
 * миттєво відкриває додавання події в Google Calendar, навіть якщо вона
 * дивиться квиток на іншому пристрої (наприклад скріншот у чаті).
 */
const TicketQR: React.FC<Props> = ({ value }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFailed(false);
    QRCode.toCanvas(canvas, value, {
      width: 112,
      margin: 0,
      color: { dark: "#3b2233", light: "#00000000" },
    }).catch(() => setFailed(true));
  }, [value]);

  if (failed) return null;

  return (
    <div className="ticket-qr">
      <canvas ref={canvasRef} width={112} height={112} />
      <span className="ticket-qr-label">скануй, щоб додати в календар</span>
    </div>
  );
};

export default TicketQR;
