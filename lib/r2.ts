import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";

let _client: S3Client | null = null;

function client(): S3Client {
  if (_client) return _client;
  const cfg = env.r2();
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return _client;
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<{ url: string; key: string }> {
  const cfg = env.r2();
  await client().send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return { key, url: `${cfg.publicBaseUrl.replace(/\/$/, "")}/${key}` };
}

export async function deleteObject(key: string): Promise<void> {
  const cfg = env.r2();
  await client().send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

export function keyFromPublicUrl(url: string): string | null {
  const base = env.r2().publicBaseUrl.replace(/\/$/, "") + "/";
  if (url.startsWith(base)) return url.slice(base.length);
  return null;
}
