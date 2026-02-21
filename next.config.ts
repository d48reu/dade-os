import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default bundler in Next.js 16
  // mapbox-gl works without any special webpack configuration
  turbopack: {},
};

export default nextConfig;
