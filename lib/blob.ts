import { del, put } from "@vercel/blob";
import { env } from "./env";

const BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

export async function uploadObject(
  pathname: string,
  body: Buffer,
  contentType: string,
): Promise<{ url: string; key: string }> {
  const blob = await put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    contentType,
    cacheControlMaxAge: 31_536_000,
    token: env.blobToken(),
  });
  return { key: blob.pathname, url: blob.url };
}

export async function deleteObject(url: string): Promise<void> {
  if (!isBlobUrl(url)) return;
  await del(url, { token: env.blobToken() });
}

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}
