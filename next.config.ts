import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // HTTPS only — blocks insecure HTTP image sources.
    // Wildcard hostname is needed because class photo_url values come from
    // diverse sources (Google, enrichment pipelines). Lock to specific
    // domains before public launch.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Limit Next.js image optimization memory usage
    minimumCacheTTL: 3600, // 1 hour — default is 60s
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/explore",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Block indexing on all pages while in dev
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
