// Runs the audit matrix (widths × text sizes × states) in a few parallel
// browser contexts. Each context opens the demo and the empty workspace
// once, then for every combination sets the viewport and preferences, loads
// the state, and runs the in-page checks at the top and after scrolling.
// Shared by scripts/layout-audit.ts and e2e/layout-audit.spec.ts.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Browser, Page } from '@playwright/test';
import { pageChecks, type PageFinding } from './pageChecks.ts';
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
}

export interface Finding extends PageFinding {
  state: string;
  width: number;
  scale: number;
}

// WCAG 1.4.12: people may override spacing; content must survive it.
const TEXT_SPACING_CSS =
  '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';

async function auditState(page: Page, opts: AuditOptions, state: AuditState, width: number, scale: number): Promise<Finding[]> {
  const found = new Map<string, Finding>();
  const add = (list: PageFinding[]) => {
    for (const f of list) found.set(`${f.check}|${f.selector}`, { ...f, state: state.id, width, scale });
  };
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
  add(await page.evaluate(pageChecks));
  // Scroll the page in steps of 80% of the screen and check again, so
  // content further down meets the sticky bars and the tab bar too.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 640; y < height - 400 && y < 6000; y += 640) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
    add((await page.evaluate(pageChecks)).filter((f) => f.check !== 'page-overflow-x'));
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
      add((await page.evaluate(pageChecks)).filter((f) => f.check !== 'page-overflow-x'));
    }
  }
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
  let statesRun = 0;

  const worker = async (slice: typeof combos) => {
    // One browser context per workspace: the workspace switch lives in
    // localStorage, which a context shares across its pages.
    const pages: Partial<Record<Workspace, Page>> = {};
    for (const ws of ['demo', 'empty'] as const) {
      if (!states.some((s) => s.ws === ws)) continue;
      const context = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await openWorkspace(page, opts.base, ws);
      pages[ws] = page;
    }
    for (const { width, scale } of slice) {
      for (const state of states) {
        const page = pages[state.ws]!;
        const list = await auditState(page, opts, state, width, scale).catch((e) => [
          { check: 'state-failed', selector: state.id, detail: String(e).split('\n')[0].slice(0, 160), state: state.id, width, scale },
        ]);
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
  return { findings, statesRun, warningCount: findings.filter((f) => f.warn).length };
}
