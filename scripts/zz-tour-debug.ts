import { chromium } from '@playwright/test';
const base = 'http://localhost:3100';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
await page.goto(base + '/demo');
await page.evaluate(() => localStorage.setItem('tide.workspace', 'demo'));
for (let run = 1; run <= 2; run++) {
  await page.goto(`${base}/?demo=start&mode=pitch&demoDebug=1`);
  const t0 = Date.now();
  let last = -1;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    const done = await page.getByRole('dialog', { name: "That's Tide." }).count();
    const steps = await page.locator('aside[aria-label="Demo steps"] li').allTextContents();
    if (steps.length !== last || done) console.log(`run ${run} t=${Math.round((Date.now() - t0) / 1000)}s steps=${steps.length} last=${steps.at(-1)} url=${page.url()} done=${done}`);
    if (done) break;
    if (steps.length === last && i > 3) {
      console.log('stalled; history', await page.evaluate(() => history.length), 'dialogs', await page.locator('[role="dialog"]').count());
      await page.screenshot({ path: `/private/tmp/claude-501/-Users-doriandanielagonzalez-Documents-Tide/c2145bf6-ebe6-4fc8-a9de-26e1ef4173c2/scratchpad/stall-${run}.png` });
      break;
    }
    last = steps.length;
  }
}
await browser.close();
