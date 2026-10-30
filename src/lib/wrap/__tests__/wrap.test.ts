// Close the day's rules (v2 spec 14, 20, 21.2): the wrap-up schema and its
// meaning checks, the prompt naming exactly the schema's fields, the
// fallback template, the day boundary, the smooth line that never
// overshoots, "later this week", the wrap_helped rule (and v1 parity), and
// the "What's been hard" summary.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WRAPUP_EXAMPLE_INPUT, findCachedResponse } from '@/data/demo/cachedResponses';
import { wrapupFallback } from '@/lib/ai/fallbacks';
import { WrapupInput, WrapupOutput, checkWrapupOutput } from '@/lib/ai/schemas';
import { computePatterns } from '@/lib/patterns/engine';
import type { PatternInput } from '@/lib/patterns/types';
import { wrapDateFor } from '@/lib/repo/dayWraps';
import type { DayWrap, StrategyUse } from '@/lib/types';
import { hardSummary } from '../hardSummary';
import { laterThisWeek } from '../facts';
import { monotonePath } from '../monotone';

const example = findCachedResponse('wrapup', WRAPUP_EXAMPLE_INPUT)!;

describe('wrapup schema and checks', () => {
  it('accepts the spec example', () => {
    expect(WrapupInput.safeParse(WRAPUP_EXAMPLE_INPUT).success).toBe(true);
    expect(WrapupOutput.safeParse(example).success).toBe(true);
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, example)).toBeNull();
  });

  it('rejects judging words, invented numbers and quoted titles that do not exist', () => {
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, { ...example, summary: 'A productive day.' })).toMatch(/productive/);
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, { ...example, summary: 'You should have rested.' })).toMatch(/should have/);
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, { ...example, highlight: 'You did 7 things.' })).toMatch(/7/);
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, { ...example, tomorrowTip: 'Start "the big history essay" first.' })).toMatch(/not a task title/);
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, { ...example, tomorrowTip: 'Start "Chemistry lab report" first.' })).toBeNull();
  });

  it('enforces the lengths', () => {
    expect(WrapupOutput.safeParse({ ...example, companionLine: 'x'.repeat(81) }).success).toBe(false);
  });

  it('names exactly the schema fields in the prompt', () => {
    const prompt = readFileSync(path.join(process.cwd(), 'prompts', '06-wrapup.md'), 'utf8');
    const block = prompt.slice(prompt.indexOf('OUTPUT SCHEMA:'));
    const fields = [...block.matchAll(/"(\w+)":/g)].map((m) => m[1]).sort();
    expect(fields).toEqual(Object.keys(WrapupOutput.shape).sort());
  });
});

describe('wrapup fallback', () => {
  it('builds plain sentences from the facts', () => {
    const out = wrapupFallback(WRAPUP_EXAMPLE_INPUT, 'Rest now.');
    expect(out.summary).toBe('You checked in 2 times today. You finished 1 task. Box breathing helped.');
    expect(out.highlight).toBe('Box breathing helped.');
    expect(out.tomorrowTip).toBe('Before writing tasks, a 3-minute walk helped 4 of 5 times.');
    expect(out.companionLine).toBe('Rest now.');
    expect(checkWrapupOutput(WRAPUP_EXAMPLE_INPUT, out)).toBeNull();
  });

  it('is kind on an empty day', () => {
    const empty = { ...WRAPUP_EXAMPLE_INPUT, facts: { checkins: [], tasksDone: [], focusBlocks: { total: 0, gotGoing: 0 }, transitions: [], strategies: [] }, reflection: { helped: [], hard: [], overall: null }, tomorrow: { anchorTaskTitle: null, firstEventTitle: null, patternHint: null } };
    const out = wrapupFallback(empty);
    expect(out).toEqual({ summary: 'You closed the day.', highlight: 'You closed the day.', tomorrowTip: 'Start small. One step is enough.', companionLine: 'Day closed.' });
  });
});

describe('the day and the line', () => {
  it('counts 1 am as the night before', () => {
    expect(wrapDateFor(new Date(2026, 9, 30, 1, 0).getTime(), '07:00')).toBe('2026-10-29');
    expect(wrapDateFor(new Date(2026, 9, 30, 21, 0).getTime(), '07:00')).toBe('2026-10-30');
  });

  it('never overshoots a check-in', () => {
    const pts = [{ x: 0, y: 100 }, { x: 50, y: 20 }, { x: 100, y: 20 }, { x: 150, y: 120 }];
    const nums = monotonePath(pts).match(/-?\d+(\.\d+)?/g)!.map(Number);
    const ys = nums.filter((_, i) => i % 2 === 1);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(20);
    expect(Math.max(...ys)).toBeLessThanOrEqual(120);
  });

  it('puts "later this week" on a weekday at least two days away', () => {
    expect(laterThisWeek('2026-10-29')).toBe('2026-11-02'); // Thursday → Monday
    expect(laterThisWeek('2026-10-26')).toBe('2026-10-28'); // Monday → Wednesday
  });
});

const wrap = (date: string, overall: DayWrap['overall'], hard: string[] = []): DayWrap => ({
  date, startedAt: 1, completedAt: new Date(`${date}T21:00:00`).getTime(), step: 13, helped: [], hard, carryover: [], overall,
});
const use = (date: string): StrategyUse => ({ id: `u-${date}`, ts: new Date(`${date}T15:00:00`).getTime(), strategyId: 'c-box', context: 'toolkit' });
const base = (): PatternInput => ({
  now: new Date('2026-10-30T22:00:00').getTime(), windowDays: 28, checkins: [], tasks: [], events: [], focusBlocks: [], strategyUses: [], transitions: [], dismissedKeys: new Set(),
});

describe('wrap_helped', () => {
  const withBox = ['2026-10-20', '2026-10-21', '2026-10-22'];
  const without = ['2026-10-23', '2026-10-24', '2026-10-25'];

  it('appears when days with a strategy end okay clearly more often', () => {
    const input = { ...base(), strategyUses: withBox.map(use), dayWraps: [...withBox.map((d) => wrap(d, 'good')), ...without.map((d) => wrap(d, 'hard'))] };
    const found = computePatterns(input).find((p) => p.key === 'wrapHelped:c-box');
    expect(found?.facts).toEqual({ strategyName: 'Box breathing', kA: 3, nA: 3, kB: 0, nB: 3 });
  });

  it('stays quiet with too few days, a small difference, or a higher minEvidence', () => {
    const few = { ...base(), strategyUses: withBox.slice(0, 2).map(use), dayWraps: [...withBox.slice(0, 2).map((d) => wrap(d, 'good')), ...without.map((d) => wrap(d, 'hard'))] };
    expect(computePatterns(few).some((p) => p.kind === 'wrap_helped')).toBe(false);
    const close = { ...base(), strategyUses: withBox.map(use), dayWraps: [...withBox.map((d) => wrap(d, 'good')), ...without.map((d) => wrap(d, 'okay'))] };
    expect(computePatterns(close).some((p) => p.kind === 'wrap_helped')).toBe(false);
    const strict = { ...base(), minEvidence: 5, strategyUses: withBox.map(use), dayWraps: [...withBox.map((d) => wrap(d, 'good')), ...without.map((d) => wrap(d, 'hard'))] };
    expect(computePatterns(strict).some((p) => p.kind === 'wrap_helped')).toBe(false);
  });

  it('changes nothing for v1 callers', () => {
    const input = { ...base(), strategyUses: withBox.map(use) };
    expect(computePatterns(input)).toEqual(computePatterns({ ...input, dayWraps: [] }));
  });
});

describe("what's been hard", () => {
  it('lists the top two over at least three closed days', () => {
    const wraps = [wrap('2026-10-20', 'hard', ['general:starting', 'general:people']), wrap('2026-10-21', 'mixed', ['general:starting']), wrap('2026-10-22', 'okay', ['general:nothing'])];
    expect(hardSummary(wraps)).toEqual([{ id: 'general:starting', k: 2, n: 3 }, { id: 'general:people', k: 1, n: 3 }]);
    expect(hardSummary(wraps.slice(0, 2))).toEqual([]);
  });
});
