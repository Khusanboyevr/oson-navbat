/**
 * Downscales an uploaded photo in the browser before it is sent.
 *
 * Profile photos are stored inline as data URLs, so a 4 MB phone snapshot has to
 * become a small square first — 512px JPEG lands around 60–120 KB, well inside the
 * limit `src/lib/server/validation.ts` enforces.
 */
export async function fileToAvatarDataUrl(file: File, maxSize = 512): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayli yuklang");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Rasmni qayta ishlab bo'lmadi");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.82);
}
