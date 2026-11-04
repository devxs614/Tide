// The layout audit (v2.1 spec 4.3): walks Tide's screens and open states at
// several widths and text sizes in a real browser and reports anything that
// overlaps, gets clipped or covered, or makes the page scroll sideways. We
// built it because "it looked fine on my laptop" kept hiding problems that
// people with big text run into every day.
//
// Run a production build first (npm run build && npx next start -p 3100),
// then: npm run audit:layout -- --label=after [--widths=320,390] [--scales=1,1.3]
// [--states=today,settings] [--font=lexend] [--bold] [--spacing] [--workers=3] [--axe]
// It uses the Chrome installed on the machine, writes a JSON report to
// docs/audits/, screenshots failing states to e2e/__audit__/, and exits 1
// when there are failures not listed in e2e/layout-audit.allow.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { runAudit, type AuditOptions } from './audit/run.ts';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const list = (name: string) => arg(name)?.split(',').filter(Boolean);
const nums = (name: string, fallback: number[]) => list(name)?.map(Number) ?? fallback;

const root = path.resolve(import.meta.dirname, '..');
const label = arg('label') ?? 'run';
const options: AuditOptions = {
  base: arg('base') ?? 'http://localhost:3100',
  widths: nums('widths', [320, 360, 390, 768, 1024, 1280]),
  scales: nums('scales', [1, 1.15, 1.3, 1.5]),
  states: list('states'),
  prefs: {
    font: (arg('font') as AuditOptions['prefs']['font']) ?? 'playful',
    theme: arg('theme') ?? 'lagoon',
    bold: process.argv.includes('--bold'),
    spacing: process.argv.includes('--spacing'),
  },
  textSpacing: process.argv.includes('--text-spacing'),
  workers: Number(arg('workers') ?? 3),
  axe: process.argv.includes('--axe'),
  screenshotDir: path.join(root, 'e2e', '__audit__', label),
};

const allow: Array<{ check: string; selector: string; state?: string; reason: string }> = JSON.parse(
  readFileSync(path.join(root, 'e2e', 'layout-audit.allow.json'), 'utf8'),
);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const started = Date.now();
const report = await runAudit(browser, options, (msg) => console.log(msg));
await browser.close();

const failures = report.findings.filter((f) => !f.warn && !allow.some((a) => a.check === f.check && f.selector.includes(a.selector) && (!a.state || a.state === f.state)));
// The team's local day, not UTC (an evening run shouldn't be filed tomorrow).
const d = new Date();
const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
mkdirSync(path.join(root, 'docs', 'audits'), { recursive: true });
const out = path.join(root, 'docs', 'audits', `${day}-${label}.json`);
writeFileSync(out, JSON.stringify({ label, createdAt: new Date().toISOString(), seconds: Math.round((Date.now() - started) / 1000), options: { ...options, screenshotDir: undefined }, failures, warnings: report.warningCount, statesRun: report.statesRun }, null, 2));

// A short table: failures per state and check.
const byKey = new Map<string, number>();
for (const f of failures) byKey.set(`${f.state} · ${f.check}`, (byKey.get(`${f.state} · ${f.check}`) ?? 0) + 1);
console.log(`\n${report.statesRun} state runs, ${failures.length} failures, ${report.warningCount} small-target warnings (${Math.round((Date.now() - started) / 1000)}s)`);
for (const [key, n] of [...byKey].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${key}`);
console.log(`Report: ${path.relative(root, out)}`);
process.exit(failures.length > 0 ? 1 : 0);
