import { readFile } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";
import { put } from "@vercel/blob";
import { MongoClient, ObjectId } from "mongodb";
import sharp from "sharp";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const RAGY_STORE_ID = new ObjectId("69e92a3b01f800c93c05b155");
const RAGY_ASSET_DIR = join(process.cwd(), "assets", "generated", "humburger-do-ragy");
const MAX_AGE = 31_536_000;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Create a Vercel Blob store and add it to this environment.`);
  return value;
}

function isR2Url(value) {
  try {
    const host = new URL(value).hostname;
    return host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com");
  } catch {
    return false;
  }
}

async function putPublic(pathname, body, contentType) {
  return put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: MAX_AGE,
    token: required("BLOB_READ_WRITE_TOKEN"),
  });
}

async function publishRagyAssets(stores) {
  const store = await stores.findOne({ _id: RAGY_STORE_ID });
  if (!store) throw new Error(`Store ${RAGY_STORE_ID.toHexString()} was not found.`);

  const [logoPng, bannerPng] = await Promise.all([
    readFile(join(RAGY_ASSET_DIR, "logo.png")),
    readFile(join(RAGY_ASSET_DIR, "banner.png")),
  ]);
  const [logo, banner] = await Promise.all([
    sharp(logoPng).resize(512, 512, { fit: "cover" }).webp({ quality: 85, effort: 5 }).toBuffer(),
    sharp(bannerPng).resize(1600, 600, { fit: "cover" }).webp({ quality: 82, effort: 5 }).toBuffer(),
  ]);
  const basePath = `stores/${store.vendorId.toHexString()}`;
  const [logoBlob, bannerBlob] = await Promise.all([
    putPublic(`${basePath}/logo/ragy-brand.webp`, logo, "image/webp"),
    putPublic(`${basePath}/banner/ragy-brand.webp`, banner, "image/webp"),
  ]);

  await stores.updateOne(
    { _id: RAGY_STORE_ID },
    { $set: { logoUrl: logoBlob.url, bannerUrl: bannerBlob.url } },
  );
  console.log(`Updated Humburger do ragy with generated Blob assets.`);
}

async function migrateUrl(collection, document, field) {
  const sourceUrl = document[field];
  if (!isR2Url(sourceUrl)) return false;

  const source = new URL(sourceUrl);
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Could not download ${sourceUrl}: HTTP ${response.status}`);

  const body = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";", 1)[0] || "application/octet-stream";
  const pathname = `migrated-r2/${source.hostname}${source.pathname}`;
  const blob = await putPublic(pathname, body, contentType);
  await collection.updateOne({ _id: document._id }, { $set: { [field]: blob.url } });
  console.log(`${collection.collectionName}/${document._id.toHexString()}.${field} migrated.`);
  return true;
}

async function migrateCollection(collection, fields) {
  const documents = await collection.find({}).toArray();
  let migrated = 0;
  let failed = 0;

  for (const document of documents) {
    for (const field of fields) {
      try {
        if (await migrateUrl(collection, document, field)) migrated += 1;
      } catch (error) {
        failed += 1;
        console.error(`Failed to migrate ${collection.collectionName}/${document._id.toHexString()}.${field}:`, error);
      }
    }
  }
  return { migrated, failed };
}

async function main() {
  const mongo = new MongoClient(required("MONGODB_URI"), { serverSelectionTimeoutMS: 10_000 });
  await mongo.connect();
  try {
    const db = mongo.db(process.env.MONGODB_DB || "loja_cibo");
    await publishRagyAssets(db.collection("stores"));

    const results = await Promise.all([
      migrateCollection(db.collection("stores"), ["logoUrl", "bannerUrl"]),
      migrateCollection(db.collection("products"), ["imageUrl"]),
      migrateCollection(db.collection("orders"), ["paymentProofUrl"]),
    ]);
    const migrated = results.reduce((total, result) => total + result.migrated, 0);
    const failed = results.reduce((total, result) => total + result.failed, 0);
    console.log(`Migration complete: ${migrated} R2 files moved to Vercel Blob; ${failed} failed.`);
    if (failed) process.exitCode = 1;
  } finally {
    await mongo.close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
