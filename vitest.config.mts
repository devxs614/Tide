// Test runner settings. Tests run in jsdom with a fake IndexedDB, so the real
// Dexie code paths are exercised without a browser.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // `server-only` throws outside a React Server Components build; in
      // tests we import server modules directly, so use its empty variant.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Flow tests render whole sheets against IndexedDB; give them room on a
    // slow laptop instead of failing on a timer.
    testTimeout: 20000,
    // v2 added many flow tests; with every core busy, a few screens took
    // over five seconds to appear and tests failed now and then. Half the
    // cores keeps each test responsive (the suite takes a little longer).
    maxWorkers: "50%",
    env: { TZ: "America/Monterrey" },
  },
});
