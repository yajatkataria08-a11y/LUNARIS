import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allows production builds on Vercel to complete without failing on lint warnings/rules
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Continue enforcing strict TypeScript checks
    ignoreBuildErrors: false,
  },
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
