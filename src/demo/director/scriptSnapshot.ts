// A plain description of a tour script (demo fix pack, 1.1): every chapter,
// then every step in order with its caption, action and target. The fix pack
// promised not to change the tour itself, only how it plays, so we saved this
// before touching anything (docs/audits/demo-script-before.json) and a test
// compares the current scripts against it. Timing fields sit apart from the
// rest, because timing is the one thing the fixes were allowed to change.
import type { Script, Step } from './types';

export interface StepSnapshot {
  chapter: string;
  id: string;
  caption: string | null;
  action: string;
  target: string | null;
  // What the action does besides waiting: the path, the typed text, the
  // custom action's name and arguments.
  details: Record<string, unknown>;
  // Allowed to change: how long things take.
  timing: Record<string, number>;
  // Allowed to change: flags that only steer playback.
  meta: Record<string, unknown>;
}

export interface ScriptSnapshot {
  id: string;
  chapters: Array<{ id: string; title: string }>;
  steps: StepSnapshot[];
}

const TIMING_KEYS = ['ms', 'cps', 'timeoutMs'];

function stepSnapshot(step: Step): StepSnapshot {
  const { kind, ...rest } = step.action as { kind: string } & Record<string, unknown>;
  const details: Record<string, unknown> = {};
  const timing: Record<string, number> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (TIMING_KEYS.includes(key) && typeof value === 'number') timing[key] = value;
    else details[key] = value;
  }
  if (step.holdMs !== undefined) timing.holdMs = step.holdMs;
  const meta: Record<string, unknown> = {};
  for (const key of ['narrate', 'presenterPause', 'hud', 'optionalTarget', 'stable'] as const) {
    if (step[key as keyof Step] !== undefined) meta[key] = step[key as keyof Step];
  }
  return { chapter: step.chapter, id: step.id, caption: step.caption ?? null, action: kind, target: step.target ?? null, details, timing, meta };
}

export function scriptSnapshot(script: Script): ScriptSnapshot {
  return { id: script.id, chapters: script.chapters.map((c) => ({ id: c.id, title: c.title })), steps: script.steps.map(stepSnapshot) };
}
