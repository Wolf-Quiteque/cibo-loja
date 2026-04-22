import sharp from "sharp";

export type ImagePreset = "photo" | "logo" | "banner" | "proof";

interface CompressResult {
  buffer: Buffer;
  contentType: "image/webp";
  ext: "webp";
}

export async function compressImage(
  input: Buffer,
  preset: ImagePreset,
): Promise<CompressResult> {
  const pipeline = sharp(input, { failOn: "error" }).rotate();

  switch (preset) {
    case "photo":
      pipeline.resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 5 });
      break;
    case "logo":
      pipeline.resize({ width: 512, height: 512, fit: "cover" }).webp({ quality: 85, effort: 5 });
      break;
    case "banner":
      pipeline.resize({ width: 1600, height: 600, fit: "cover" }).webp({ quality: 80, effort: 5 });
      break;
    case "proof":
      pipeline.resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 78, effort: 5 });
      break;
  }

  const buffer = await pipeline.toBuffer();
  return { buffer, contentType: "image/webp", ext: "webp" };
}
