import html2canvas from "html2canvas";

type Html2CanvasOptions = NonNullable<Parameters<typeof html2canvas>[1]>;

/**
 * Рендерить DOM-вузол у PNG (для «поділитись як картинкою» — щоб можна
 * було надіслати квиток у Telegram/Instagram так само, як звичайний
 * скріншот). scale підвищений для чіткості на ретіна-екранах.
 */
export const renderNodeToBlob = async (
  node: HTMLElement,
  options?: Partial<Html2CanvasOptions>,
): Promise<Blob> => {
  // чекаємо, поки довантажиться шрифт — інакше перший рендер може
  // впіймати системний fallback замість Nunito
  await document.fonts?.ready?.catch(() => {});

  const canvas = await html2canvas(node, {
    backgroundColor: "#fff4f7",
    scale: Math.min(window.devicePixelRatio || 2, 3),
    useCORS: true,
    ...options,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("не вдалось згенерувати зображення"));
    }, "image/png");
  });
};

type ShareImageResult = "shared" | "saved" | "downloaded" | "cancelled";

/**
 * Мінімальний неофіційний тип для опційної інтеграції з пісочницею
 * прев'ю-редактора (claude.ai artifact) — на реальному сайті window.claude
 * просто відсутній, і ця гілка ніколи не виконується.
 */
interface ClaudeDownloads {
  save: (req: { filename: string; data: Blob }) => Promise<unknown>;
}
declare global {
  interface Window {
    claude?: { use?: (name: string) => Promise<unknown> };
  }
}

/**
 * Пропонує зображення користувачу: спершу нативне «Поділитись» (на
 * телефоні це відкриє список застосунків — Telegram, Instagram тощо,
 * так само як зі звичайним фото); якщо share недоступний — пробує
 * зберегти файл. Три рівні запасних варіантів, як і з текстовим шарінгом.
 */
export const shareOrSaveImage = async (
  blob: Blob,
  filename: string,
  shareTitle: string,
): Promise<ShareImageResult> => {
  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: shareTitle });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // інакше (наприклад заборонено пісочницею) — пробуємо далі
    }
  }

  // Опційно: у прев'ю-редакторі (claude.ai artifact) звичайне
  // завантаження заблоковане, але png дозволений через їхній власний
  // API збереження файлів. На реальному сайті window.claude не існує,
  // тому цей блок просто пропускається.
  try {
    const downloads = (await window.claude?.use?.(
      "downloads",
    )) as ClaudeDownloads | null;
    if (downloads) {
      await downloads.save({ filename, data: blob });
      return "saved";
    }
  } catch {
    // недоступно чи відхилено — пробуємо звичайне завантаження нижче
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return "downloaded";
};
