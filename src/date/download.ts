/**
 * Зберігає Blob як файл. URL не можна відкликати одразу після click():
 * Safari/iOS часом ще не почав завантаження, і воно мовчки скасовується,
 * тому відкликаємо із затримкою.
 */
export const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
};
