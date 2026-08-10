"use server";

import { requireSession } from "@/lib/auth";
import { compressImage, type ImagePreset } from "@/lib/images";
import { uploadObject } from "@/lib/blob";

// Vercel Server Actions accept at most 4.5 MB request bodies. Keep a margin.
const MAX_INPUT_BYTES = 4 * 1024 * 1024;

export async function uploadImage(
  file: File,
  preset: ImagePreset,
  prefix: string,
): Promise<{ url: string; key: string }> {
  await requireSession();

  if (!file || file.size === 0) throw new Error("Ficheiro vazio");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Imagem demasiado grande (máx 4 MB)");
  if (!file.type.startsWith("image/")) throw new Error("Tipo de ficheiro inválido");

  const raw = Buffer.from(await file.arrayBuffer());
  const { buffer, contentType, ext } = await compressImage(raw, preset);

  const key = `${prefix.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  return uploadObject(key, buffer, contentType);
}
