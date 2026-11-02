// When a refocus nudge may appear (v2.1 F-07, spec 11.4), as plain rules:
// never in a block's first or last 2 minutes, never while a sheet is open,
// at most one every 5 minutes of any kind, at most 6 a block, and never
// again once "Stop nudges for this block" was tapped. Times are a block's
// own elapsed time (pauses don't count).
import { MINUTE } from '../time';
import type { Settings } from '../types';

export const EDGE_MS = 2 * MINUTE;
export const SPACING_MS = 5 * MINUTE;
export const MAX_PER_BLOCK = 6;
// Hidden at least this long before "Welcome back" is worth saying.
export const RETURN_AFTER_MS = 30_000;

export interface NudgeLog {
  shown: number;
  last: number | null;
  // How many interval marks (every N minutes) have passed, shown or not.
  marks: number;
  stopped: boolean;
}

// The full demo tour shows one check-in card on cue (spec 21.4) instead of
// waiting minutes for the interval; the director sends this window event.
export const DEMO_NUDGE_EVENT = 'tide:demo-nudge';

export const EMPTY_LOG: NudgeLog = { shown: 0, last: null, marks: 0, stopped: false };

export function mayNudge(elapsed: number, total: number, log: NudgeLog, blocked: boolean): boolean {
  return (
    !blocked &&
    !log.stopped &&
    log.shown < MAX_PER_BLOCK &&
    elapsed >= EDGE_MS &&
    total - elapsed >= EDGE_MS &&
    (log.last === null || elapsed - log.last >= SPACING_MS)
  );
}

export const recordNudge = (log: NudgeLog, elapsed: number): NudgeLog => ({ ...log, shown: log.shown + 1, last: elapsed });

// The interval check-in: due when a new "every N minutes" mark has passed.
// A mark that falls in an edge or too soon after another nudge is skipped,
// not saved for later.
export function intervalStep(elapsed: number, total: number, everyMs: number, log: NudgeLog, blocked: boolean): { log: NudgeLog; show: boolean } {
  const mark = Math.floor(elapsed / everyMs);
  if (mark <= log.marks) return { log, show: false };
  const next = { ...log, marks: mark };
  if (!mayNudge(elapsed, total, log, blocked)) return { log: next, show: false };
  return { log: recordNudge(next, elapsed), show: true };
}

export function hiddenDelayMs(setting: Settings['focus.nudgeHiddenAfter']): number | null {
  return setting === 'off' ? null : Number(setting) * MINUTE;
}
