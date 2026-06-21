import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This landing app is self-contained; pin the workspace root so Turbopack
  // doesn't pick up the demo prototype's lockfile one level up.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
