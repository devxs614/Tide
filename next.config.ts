// Next.js settings for Tide.
// Cache Components is left off on purpose: Tide keeps everything in the
// browser (IndexedDB), so server caching buys nothing, and turning it on
// would forbid the `runtime`/`dynamic` exports our AI routes rely on.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The AI routes read their system prompts from /prompts at runtime, so the
  // Markdown files must ship with the server bundle (Vercel included).
  outputFileTracingIncludes: {
    "/api/ai/*": ["./prompts/**/*"],
    "/prompts-doc": ["./prompts/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
