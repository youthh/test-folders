import React, { useRef, useState } from "react";
import { musicUrl } from "./config";

/**
 * Кнопка фонової музики. Показується, лише якщо в config.musicUrl щось
 * вказано — без файлу/посилання на пісню кнопки просто немає, і жодних
 * порожніх заглушок на сайті не лишається.
 *
 * Плей за замовчуванням браузери блокують без дії користувача, тому це
 * саме кнопка, а не автоплей.
 */
const MusicToggle: React.FC = () => {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!musicUrl) return null;

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // автоплей заблокував браузер — просто лишаємось у стані "не грає"
      });
    }
    setPlaying((p) => !p);
  };

  return (
    <>
      <audio ref={ref} src={musicUrl} loop />
      <button
        type="button"
        className="music-toggle"
        onClick={toggle}
        aria-label={playing ? "вимкнути музику" : "увімкнути музику"}
      >
        {playing ? "🔊" : "🔈"}
      </button>
    </>
  );
};

export default MusicToggle;
