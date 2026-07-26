import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Required: package.json's "build"/"start" scripts copy files into
  // .next/standalone/ and run it directly. Without this flag Next.js
  // never creates that folder and both scripts fail.
  output: "standalone",
};

export default nextConfig;
