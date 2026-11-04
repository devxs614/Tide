// The visual baseline for the v2.2 bug sweep (spec 3.3): screenshots of every
// screen and open state at default settings, taken before any fix and again
// at the end, so a pixel comparison can prove the sweep changed nothing but
// the bugs. It reuses the layout audit's states and setup.
//
// Run a production build first (npm run build && npx next start -p 3100),
// then: node scripts/visual-baseline.ts --label=baseline (or --label=after).
// Screenshots go to e2e/__visual__/<label>/ (git-ignored, they're large);
// the hashes go to e2e/visual-<label>-manifest.json, which is committed.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from '@playwright/test';
import { applyPrefs, DEFAULT_PREFS, openWorkspace, settle, writeSettings, type Workspace } from './audit/prepare.ts';
import { STATES, type AuditState } from './audit/states.ts';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const label = arg('label') ?? 'baseline';
const base = arg('base') ?? 'http://localhost:3100';
const only = arg('states')?.split(',');
const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'e2e', '__visual__', label);
mkdirSync(dir, { recursive: true });

// Thursday, Nov 5, 2026, 3:40 pm: the demo's afternoon. Date is frozen there
// for the whole run, so clocks, greetings and the Tide Line "Now" marker
// draw the same way every time; timers still run.
const FROZEN = new Date(2026, 10, 5, 15, 40).getTime();
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
];

const demo = (id: string) => `[data-demo-id="${id}"]`;
const tap = async (page: Page, selector: string) => {
  await page.locator(selector).first().click({ timeout: 8000 });
  await page.waitForTimeout(400);
};
const firstTask = (page: Page) =>
  page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open('tide-demo');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tasks = await new Promise<Array<{ id: string; status: string }>>((res) => {
      const req = db.transaction('tasks').objectStore('tasks').getAll();
      req.onsuccess = () => res(req.result);
    });
    db.close();
    return (tasks.find((t) => t.status === 'in_progress') ?? tasks[0]).id;
  });

// A few states the spec lists that the layout audit doesn't open.
const EXTRA: AuditState[] = [
  { id: 'focus:running', route: async (page) => `/focus/${await firstTask(page)}`, ws: 'demo', open: (page) => tap(page, demo('focus-start')) },
  {
    id: 'focus:outcome',
    route: async (page) => `/focus/${await firstTask(page)}`,
    ws: 'demo',
    open: async (page) => {
      // "I'm done early" asks how it went (the outcome sheet) right away.
      await tap(page, demo('focus-start'));
      await tap(page, 'button:has-text("I\'m done early"):visible');
      await page.locator(demo('focus-outcome-got_going')).waitFor({ timeout: 8000 });
    },
  },
  {
    id: 'sheet:unstick2',
    route: async (page) => `/tasks?unstick=${await firstTask(page)}`,
    ws: 'demo',
    open: async (page) => {
      await tap(page, demo('unstick-reason-dont_know_start'));
      await page.locator(demo('unstick-start')).waitFor({ timeout: 10_000 });
    },
  },
];

// The audit's own isolated states install Playwright's clock themselves,
// which can't share a page with the frozen Date here.
// Where both define a state, this script's own version wins, so later runs
// stay comparable with the baseline.
const states = [...STATES.filter((s) => !s.isolate && !EXTRA.some((e) => e.id === s.id)), ...EXTRA].filter((s) => !only || only.some((id) => s.id === id || s.id.startsWith(`${id}:`)));

async function prepare(ws: Workspace) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: VIEWPORTS[0], reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.clock.setFixedTime(FROZEN);
  // A seeded Math.random, restarted on every load, so anything "random"
  // (a companion line, a particle) picks the same way in both runs.
  await page.addInitScript(() => {
    let s = 42;
    Math.random = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
  await openWorkspace(page, base, ws);
  return { browser, page };
}

const manifest: Record<string, { sha256: string; ok: boolean; error?: string }> = {};
for (const ws of ['demo', 'empty'] as const) {
  const list = states.filter((s) => s.ws === ws);
  if (!list.length) continue;
  const { browser, page } = await prepare(ws);
  for (const vp of VIEWPORTS) {
    for (const state of list) {
      const name = `${state.id.replace(/[:/]/g, '_')}-${vp.width}`;
      try {
        await page.setViewportSize(vp);
        await applyPrefs(page, ws, DEFAULT_PREFS);
        // Every state starts from the same afternoon; a state that needs
        // another time (the bridge, the wrap) sets it in its own `before`.
        if (ws === 'demo') await writeSettings(page, ws, { demoClock: { base: FROZEN, startedAt: FROZEN } });
        if (state.before) await state.before(page);
        const route = typeof state.route === 'string' ? state.route : await state.route(page);
        await page.goto(`${base}${route}`);
        await settle(page);
        if (state.open) {
          await state.open(page);
          await settle(page);
        }
        await page.waitForTimeout(500);
        const file = path.join(dir, `${name}.png`);
        // Open sheets and dialogs are fixed to the screen; whole pages are
        // captured top to bottom.
        await page.screenshot({ path: file, fullPage: !state.open, animations: 'disabled', caret: 'hide' });
        manifest[name] = { sha256: createHash('sha256').update(readFileSync(file)).digest('hex'), ok: true };
      } catch (e) {
        manifest[name] = { sha256: '', ok: false, error: String(e).split('\n')[0].slice(0, 160) };
      }
    }
    console.log(`${ws} ${vp.width}px: done`);
  }
  await browser.close();
}

const out = path.join(root, 'e2e', `visual-${label}-manifest.json`);
writeFileSync(out, JSON.stringify({ label, createdAt: new Date().toISOString(), frozenAt: new Date(FROZEN).toISOString(), viewports: VIEWPORTS, shots: manifest }, null, 2));
const failed = Object.entries(manifest).filter(([, v]) => !v.ok);
console.log(`${Object.keys(manifest).length} screenshots, ${failed.length} not captured${failed.length ? ': ' + failed.map(([k, v]) => `${k} (${v.error})`).join('; ') : ''}`);
console.log(`Manifest: ${path.relative(root, out)}`);
