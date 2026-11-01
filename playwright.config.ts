// Playwright setup for Tide's browser checks (v2.1): the layout audit as a
// test. It drives the Chrome installed on the machine instead of downloading
// a browser, against a production build on port 3100 (a different origin
// from `npm run dev`, so it never touches the data in a developer's tab).
// Build first: npm run build. Then: npm run e2e
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30 * 60_000,
  reporter: 'list',
  use: { channel: 'chrome', headless: true },
  webServer: {
    command: 'npx next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
