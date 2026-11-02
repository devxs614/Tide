// Runs the guided demo tour in a real browser and reports every step (v2.1).
// The tests mock navigation and the director's custom actions, so only a
// real run shows whether a tour still reaches its end; v2 found six bugs
// that way. This makes that run repeatable instead of a manual session.
//
// Run a production build first (npm run build && npx next start -p 3100),
// then: node scripts/run-tour.ts [pitch|full] [runs=2]
// It uses the installed Chrome with a fresh profile (so nobody's own data is
// in reach), runs the tour back to back, and exits 1 if a step is skipped,
// a run doesn't finish, or the tour asks the AI anything.
import { chromium } from '@playwright/test';

const base = process.env.TIDE_BASE_URL ?? 'http://localhost:3100';
const mode = process.argv[2] === 'full' ? 'full' : 'pitch';
const runs = Number(process.argv[3] ?? 2);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const aiCalls: string[] = [];
page.on('request', (r) => {
  if (r.url().includes('/api/ai/')) aiCalls.push(r.url());
});

let failed = false;
await page.goto(base + '/demo');
await page.evaluate(() => localStorage.setItem('tide.workspace', 'demo'));
for (let run = 1; run <= runs; run++) {
  const started = Date.now();
  await page.goto(`${base}/?demo=start&mode=${mode}&demoDebug=1`);
  try {
    await page.getByRole('dialog', { name: "That's Tide." }).waitFor({ timeout: 6 * 60_000 });
  } catch {
    failed = true;
  }
  const steps = await page.locator('aside[aria-label="Demo steps"] li').allTextContents();
  const skipped = steps.filter((s) => s.startsWith('skipped'));
  const seconds = Math.round((Date.now() - started) / 1000);
  console.log(`${mode} run ${run}: ${steps.length - skipped.length} of ${steps.length} steps in ${seconds}s${skipped.length ? `; skipped: ${skipped.join(', ')}` : ''}`);
  if (skipped.length || steps.length === 0) failed = true;
}
console.log(aiCalls.length ? `AI requests: ${aiCalls.join(', ')}` : 'No AI requests.');
await browser.close();
process.exit(failed || aiCalls.length ? 1 : 0);
