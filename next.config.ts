import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: an unrelated lockfile in a parent directory
  // otherwise makes Turbopack guess the wrong root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
