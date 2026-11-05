// The demo fix pack changed how the tour plays, not what it shows: the same
// chapters, steps, captions (word for word), actions and targets as before
// the fixes (fixtures/demo-script-before.json, saved from the scripts at
// tag pre-demo-fix). Only timing and playback flags may differ: the steps
// about the companion, the theme step's shared caption, and the nudge's
// fast-forward speed.
import { describe, expect, it } from 'vitest';
import before from './fixtures/demo-script-before.json';
import { scriptSnapshot, type ScriptSnapshot, type StepSnapshot } from '../director/scriptSnapshot';
import { FULL } from '../director/scripts/full';
import { PITCH } from '../director/scripts/pitch';

// The demo clock's speed was filed with the action's details in the saved
// file and with timing now; it is timing either way.
function normalize(step: StepSnapshot): StepSnapshot {
  const { multiplier, ...details } = step.details as Record<string, unknown>;
  const timing = typeof multiplier === 'number' ? { ...step.timing, multiplier } : step.timing;
  return { ...step, details, timing };
}

const ALLOWED_META = new Set(['companion', 'holdDuringAction', 'optionalTarget']);

describe('the tour scripts after the demo fixes', () => {
  for (const [name, now] of [['full', scriptSnapshot(FULL)], ['pitch', scriptSnapshot(PITCH)]] as Array<[keyof typeof before, ScriptSnapshot]>) {
    const was = before[name] as ScriptSnapshot;

    it(`${name}: the same chapters, steps, captions, actions and targets`, () => {
      expect(now.chapters).toEqual(was.chapters);
      expect(now.steps.map((s) => s.id)).toEqual(was.steps.map((s) => s.id));
      now.steps.forEach((step, i) => {
        const a = normalize(step);
        const b = normalize(was.steps[i]);
        expect(a.caption, step.id).toBe(b.caption);
        expect({ chapter: a.chapter, action: a.action, target: a.target, details: a.details }, step.id).toEqual({ chapter: b.chapter, action: b.action, target: b.target, details: b.details });
      });
    });

    it(`${name}: only timing and playback flags changed`, () => {
      now.steps.forEach((step, i) => {
        const old = was.steps[i].meta;
        for (const [key, value] of Object.entries(step.meta)) if (!ALLOWED_META.has(key)) expect(value, `${step.id} ${key}`).toEqual(old[key]);
        for (const key of Object.keys(old)) expect(step.meta[key], `${step.id} ${key}`).toEqual(old[key]);
      });
    });
  }

  it('changed the timing of the nudge fast-forward only', () => {
    const sorted = (o: Record<string, number>) => JSON.stringify(Object.entries(o).sort());
    const changed = scriptSnapshot(FULL).steps.filter((s, i) => sorted(normalize(s).timing) !== sorted(normalize((before.full as ScriptSnapshot).steps[i]).timing));
    expect(changed.map((s) => [s.id, s.timing])).toEqual([['focus.nudgeSpeed', { multiplier: 20, holdMs: 300 }]]);
  });
});
