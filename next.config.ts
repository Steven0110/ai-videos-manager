import type { NextConfig } from "next";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

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
    };
    return config;
  },
  trailingSlash: true,
  ...(isProduction && {
    output: "export",
    distDir: "build",
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
