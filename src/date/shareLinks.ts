/** Посилання «поділитись» у Telegram: url обов'язковий, text — повідомлення. */
export const buildTelegramShareUrl = (text: string, url: string) =>
  `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
    text,
  )}`;

/** Посилання «поділитись» у WhatsApp: усе повідомлення йде в text. */
export const buildWhatsAppShareUrl = (text: string) =>
  `https://wa.me/?text=${encodeURIComponent(text)}`;
