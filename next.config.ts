import type { NextConfig } from "next";

function imageHostPatterns() {
  const patterns: { protocol: "https"; hostname: string }[] = [
    { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
  ];
  // Keep existing images visible until `npm run migrate:r2-to-blob` has moved them.
  const publicBase = process.env.R2_PUBLIC_BASE_URL;
  if (publicBase) {
    try {
      patterns.push({ protocol: "https", hostname: new URL(publicBase).hostname });
    } catch {}
  }
  patterns.push({ protocol: "https", hostname: "*.r2.cloudflarestorage.com" });
  patterns.push({ protocol: "https", hostname: "*.r2.dev" });
  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHostPatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
