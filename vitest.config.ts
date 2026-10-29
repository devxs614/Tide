// Test runner settings. Tests run in jsdom with a fake IndexedDB, so the real
// Dexie code paths are exercised without a browser.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Flow tests render whole sheets against IndexedDB; give them room on a
    // slow laptop instead of failing on a timer.
    testTimeout: 20000,
    env: { TZ: "America/Monterrey" },
  },
});
