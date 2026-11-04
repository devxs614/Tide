// Runs the audit matrix (widths × text sizes × states) in a few parallel
// browser contexts. Each context opens the demo and the empty workspace
// once, then for every combination sets the viewport and preferences, loads
// the state, and runs the in-page checks at the top and after scrolling.
// Since the v2.2 sweep it also records console errors, failed requests and
// the frame's width, and can run axe. Shared by scripts/layout-audit.ts and
// e2e/layout-audit.spec.ts.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import type { Browser, Page } from '@playwright/test';
import { pageChecks, type PageFinding } from './pageChecks.ts';
import { endCoverage, frameWidth, sweepChecks } from './sweepChecks.ts';
import { applyPrefs, openWorkspace, settle, type Prefs, type Workspace } from './prepare.ts';
import { STATES, type AuditState } from './states.ts';

export interface AuditOptions {
  base: string;
  widths: number[];
  scales: number[];
  states?: string[];
  prefs: Omit<Prefs, 'textScale'>;
  textSpacing?: boolean;
  workers: number;
  screenshotDir?: string;
  // axe at 390px (text 100% and 150%) and 1280px (100%): a full matrix of
  // axe runs would take hours and find the same things.
  axe?: boolean;
}

export interface Finding extends PageFinding {
  state: string;
  width: number;
  scale: number;
}

// WCAG 1.4.12: people may override spacing; content must survive it.
const TEXT_SPACING_CSS =
  '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';

// What the page said while a state was open: console errors and warnings,
// uncaught errors, and requests that failed.
const heard = new WeakMap<Page, PageFinding[]>();
function listen(page: Page) {
  const list: PageFinding[] = [];
  heard.set(page, list);
  // Without an API key the AI routes answer 503 (missing_key) and, under the
  // audit's load, 429 (the rate limiter); the app falls back on both, by
  // design. Chrome logs each as an error, so those lines are left out too.
  const intended = (url: string, status: number) => url.includes('/api/ai/') && (status === 503 || status === 429);
  page.on('console', (m) => {
    if (m.type() !== 'error' && m.type() !== 'warning') return;
    const status = Number(/status of (\d{3})/.exec(m.text())?.[1] ?? 0);
    if (status && intended(m.location().url, status)) return;
    list.push({ check: 'console', selector: m.type(), detail: m.text().slice(0, 200) });
  });
  page.on('pageerror', (e) => list.push({ check: 'console', selector: 'pageerror', detail: String(e).slice(0, 200) }));
  page.on('response', (r) => {
    if (r.status() >= 400 && !intended(r.url(), r.status())) list.push({ check: 'network', selector: new URL(r.url()).pathname, detail: String(r.status()) });
  });
  page.on('requestfailed', (r) => {
    // Navigating away cancels requests on purpose; that's not a failure.
    if (r.failure()?.errorText !== 'net::ERR_ABORTED') list.push({ check: 'network', selector: new URL(r.url()).pathname, detail: r.failure()?.errorText ?? 'failed' });
  });
}

// Frame widths per state and width, by text size; compared at the end.
type Widths = Map<string, Map<number, number>>;

async function auditState(page: Page, opts: AuditOptions, state: AuditState, width: number, scale: number, widths: Widths): Promise<Finding[]> {
  const found = new Map<string, Finding>();
  const add = (list: PageFinding[]) => {
    for (const f of list) found.set(`${f.check}|${f.selector}|${f.detail.slice(0, 40)}`, { ...f, state: state.id, width, scale });
  };
  const said = heard.get(page);
  if (said) said.length = 0;
  const check = async () => [...(await page.evaluate(pageChecks)), ...(await page.evaluate(sweepChecks))];
  await page.setViewportSize({ width, height: 800 });
  await applyPrefs(page, state.ws, { ...opts.prefs, textScale: scale });
  if (state.before) await state.before(page);
  const route = typeof state.route === 'string' ? state.route : await state.route(page);
  await page.goto(`${opts.base}${route}`);
  await settle(page);
  if (opts.textSpacing) await page.addStyleTag({ content: TEXT_SPACING_CSS });
  if (state.open) {
    try {
      await state.open(page);
      await settle(page);
    } catch (e) {
      add([{ check: 'state-failed', selector: state.id, detail: String(e).split('\n')[0].slice(0, 160) }]);
      return [...found.values()];
    }
  }
  add(await check());
  const key = `${state.id}|${width}`;
  if (!widths.has(key)) widths.set(key, new Map());
  widths.get(key)!.set(scale, await page.evaluate(frameWidth));
  // Scroll the page in steps of 80% of the screen and check again, so
  // content further down meets the sticky bars and the tab bar too.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 640; y < height - 400 && y < 6000; y += 640) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
    add((await check()).filter((f) => f.check !== 'page-overflow-x'));
  }
  // Inside an open sheet the sheet scrolls, not the page: check the middle
  // and the very end of it too.
  const sheetHeight = await page.evaluate(() => document.querySelector('[data-slot="sheet-content"]')?.scrollHeight ?? 0);
  if (sheetHeight) {
    for (const where of ['middle', 'end'] as const) {
      await page.evaluate((w) => {
        const s = document.querySelector('[data-slot="sheet-content"]')!;
        s.scrollTop = w === 'end' ? s.scrollHeight : s.scrollHeight / 2 - s.clientHeight / 2;
      }, where);
      await page.waitForTimeout(120);
      add((await check()).filter((f) => f.check !== 'page-overflow-x'));
    }
  }
  // Scrolled all the way down (the open sheet, or the page), nothing may
  // stay under a floating control. endCoverage does its own scrolling.
  await page.evaluate(endCoverage);
  await page.waitForTimeout(150);
  add(await page.evaluate(endCoverage));
  if (opts.axe && ((width === 390 && (scale === 1 || scale === 1.5)) || (width === 1280 && scale === 1))) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const result = await new AxeBuilder({ page }).analyze().catch(() => null);
    for (const v of result?.violations ?? []) {
      if (v.impact !== 'serious' && v.impact !== 'critical' && v.impact !== 'moderate') continue;
      for (const n of v.nodes.slice(0, 5)) add([{ check: `axe:${v.id}`, selector: n.target.join(' '), detail: `${v.impact}: ${v.help}`, warn: v.impact === 'moderate' }]);
    }
  }
  if (said) add(said);
  const list = [...found.values()];
  if (opts.screenshotDir && list.some((f) => !f.warn)) {
    mkdirSync(opts.screenshotDir, { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(opts.screenshotDir, `${state.id.replace(/[:/]/g, '_')}-${width}-${scale}.png`) }).catch(() => {});
  }
  return list;
}

export async function runAudit(browser: Browser, opts: AuditOptions, log: (msg: string) => void = () => {}) {
  const states = STATES.filter((s) => !opts.states || opts.states.some((id) => s.id === id || s.id.startsWith(`${id}:`)));
  const combos = opts.widths.flatMap((width) => opts.scales.map((scale) => ({ width, scale })));
  const findings: Finding[] = [];
  const widths: Widths = new Map();
  let statesRun = 0;

  const worker = async (slice: typeof combos) => {
    // One browser context per workspace: the workspace switch lives in
    // localStorage, which a context shares across its pages.
    const pages: Partial<Record<Workspace, Page>> = {};
    for (const ws of ['demo', 'empty'] as const) {
      if (!states.some((s) => s.ws === ws)) continue;
      const context = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      listen(page);
      await openWorkspace(page, opts.base, ws);
      pages[ws] = page;
    }
    for (const { width, scale } of slice) {
      for (const state of states) {
        let page = pages[state.ws]!;
        if (state.isolate) {
          page = await (await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' })).newPage();
          listen(page);
          await openWorkspace(page, opts.base, state.ws);
        }
        const list = await auditState(page, opts, state, width, scale, widths).catch((e) => [
          { check: 'state-failed', selector: state.id, detail: String(e).split('\n')[0].slice(0, 160), state: state.id, width, scale },
        ]);
        if (state.isolate) await page.context().close();
        findings.push(...list);
        statesRun++;
      }
      log(`  ${width}px × ${scale}: done`);
    }
    for (const p of Object.values(pages)) await p?.context().close();
  };

  const n = Math.max(1, Math.min(opts.workers, combos.length));
  const slices = Array.from({ length: n }, (_, i) => combos.filter((_, j) => j % n === i));
  await Promise.all(slices.map(worker));
  // Bigger text must never widen the phone column itself.
  for (const [key, byScale] of widths) {
    const one = byScale.get(1);
    if (one === undefined || one < 0) continue;
    for (const [scale, w] of byScale) {
      const [state, width] = key.split('|');
      if (w > one + 1) findings.push({ check: 'frame-width', selector: 'frame', detail: `${one}px at 1× → ${w}px at ${scale}×`, state, width: Number(width), scale });
    }
  }
  return { findings, statesRun, warningCount: findings.filter((f) => f.warn).length };
}
