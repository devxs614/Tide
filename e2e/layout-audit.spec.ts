// The layout audit as a test (v2.1 spec 4.3): the full width × text-size
// matrix with the playful font and Lagoon, then spot checks with the other
// fonts, bold text and extra spacing at 360 and 390px. It fails on any
// finding that isn't listed, with a reason, in layout-audit.allow.json.
// The same checks run from the command line: npm run audit:layout.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { runAudit, type AuditOptions, type Finding } from '../scripts/audit/run.ts';

const allow: Array<{ check: string; selector: string; state?: string; reason: string }> = JSON.parse(
  readFileSync(path.join(import.meta.dirname, 'layout-audit.allow.json'), 'utf8'),
);
const unexpected = (list: Finding[]) =>
  list.filter((f) => !f.warn && !allow.some((a) => a.check === f.check && f.selector.includes(a.selector) && (!a.state || a.state === f.state)));
const summary = (list: Finding[]) => list.slice(0, 25).map((f) => `${f.state} ${f.width}px ×${f.scale} ${f.check}: ${f.selector} (${f.detail})`);

const base: Omit<AuditOptions, 'widths' | 'scales'> = {
  base: 'http://localhost:3100',
  prefs: { font: 'playful', theme: 'lagoon', bold: false, spacing: false },
  workers: 3,
};

test('every screen at every width and text size', async ({ browser }) => {
  const report = await runAudit(browser, { ...base, widths: [320, 360, 390, 768, 1024, 1280], scales: [1, 1.15, 1.3, 1.5] });
  expect(summary(unexpected(report.findings))).toEqual([]);
});

test('other fonts, bold text and extra spacing at large sizes', async ({ browser }) => {
  for (const prefs of [
    { font: 'hyperlegible', theme: 'lagoon', bold: true, spacing: false },
    { font: 'lexend', theme: 'midnightTide', bold: false, spacing: true },
  ] as const) {
    const report = await runAudit(browser, { ...base, prefs, widths: [360, 390], scales: [1.3, 1.5] });
    expect(summary(unexpected(report.findings))).toEqual([]);
  }
});

test('200% browser zoom on a laptop (a 640px viewport) at 1.3', async ({ browser }) => {
  const report = await runAudit(browser, { ...base, widths: [640], scales: [1.3] });
  expect(summary(unexpected(report.findings))).toEqual([]);
});
