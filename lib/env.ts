function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

export const env = {
  mongoUri: () => required("MONGODB_URI"),
  mongoDb: () => process.env.MONGODB_DB || "loja_cibo",
  jwtSecret: () => required("JWT_SECRET"),
  blobToken: () => required("BLOB_READ_WRITE_TOKEN"),
};
