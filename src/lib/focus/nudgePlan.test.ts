// When refocus nudges may appear (v2.1 F-07, spec 11.6): every N minutes,
// never in the first or last 2 minutes, 5 minutes apart at least, 6 a
// block at most, never after "Stop nudges for this block", never while a
// sheet is open.
import { describe, expect, it } from 'vitest';
import { MINUTE } from '@/lib/time';
import { EMPTY_LOG, hiddenDelayMs, intervalStep, mayNudge, recordNudge, type NudgeLog } from './nudgePlan';

const TOTAL = 25 * MINUTE;

function run(every: number, total = TOTAL, stepMs = 15_000) {
  let log: NudgeLog = EMPTY_LOG;
  const shown: number[] = [];
  for (let t = 0; t <= total; t += stepMs) {
    const step = intervalStep(t, total, every * MINUTE, log, false);
    log = step.log;
    if (step.show) shown.push(t / MINUTE);
  }
  return shown;
}

describe('the nudge schedule', () => {
  it('nudges every N minutes, but not in the first or last 2 minutes', () => {
    expect(run(10)).toEqual([10, 20]);
    expect(run(5)).toEqual([5, 10, 15, 20]);
    // A 20-minute mark in a 21-minute block falls in the last 2 minutes.
    expect(run(10, 21 * MINUTE)).toEqual([10]);
  });

  it('keeps 5 minutes between nudges of any kind and stops at 6', () => {
    const afterReturn = recordNudge(EMPTY_LOG, 8 * MINUTE);
    expect(intervalStep(10 * MINUTE, TOTAL, 10 * MINUTE, afterReturn, false).show).toBe(false);
    expect(mayNudge(13 * MINUTE, TOTAL, afterReturn, false)).toBe(true);
    const six: NudgeLog = { ...EMPTY_LOG, shown: 6 };
    expect(mayNudge(60 * MINUTE, 120 * MINUTE, six, false)).toBe(false);
    expect(run(5, 120 * MINUTE)).toHaveLength(6);
  });

  it('stays quiet once stopped, and while a sheet is open', () => {
    expect(intervalStep(10 * MINUTE, TOTAL, 10 * MINUTE, { ...EMPTY_LOG, stopped: true }, false).show).toBe(false);
    const blocked = intervalStep(10 * MINUTE, TOTAL, 10 * MINUTE, EMPTY_LOG, true);
    expect(blocked.show).toBe(false);
    // The mark is used up, not saved for later.
    expect(intervalStep(11 * MINUTE, TOTAL, 10 * MINUTE, blocked.log, false).show).toBe(false);
  });

  it('turns the hidden-tab setting into a delay', () => {
    expect(hiddenDelayMs('off')).toBeNull();
    expect(hiddenDelayMs('2')).toBe(2 * MINUTE);
  });
});
