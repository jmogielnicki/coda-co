import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Book cover images on /books, keyed by ISBN.
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/b/isbn/**",
      },
    ],
  },
  experimental: {
    // Default is 1 MB. Image uploads pass through server actions, and our
    // 5 MB file cap plus multipart overhead needs more headroom than the
    // default. Keep this just above MAX_IMAGE_BYTES in lib/images.ts.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
