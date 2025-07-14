import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "~public": path.resolve("./public"),
      "@": path.resolve("./app"),
      "@/{core}": path.resolve("./app/{core}")
    };
    return config;
  },
  trailingSlash: true,
};

module.exports = nextConfig;
