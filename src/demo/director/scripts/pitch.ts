// The 100-second pitch cut (v2 spec 16.9): the same chapters, shorter holds,
// faster typing. Works in autoplay and presenter mode.
import type { Script, Step } from '../types';
import { CHAPTERS, CHECKIN_STEPS, LIGHTER_STEPS, PATTERN_STEPS, SHORE_STEPS, SWITCH_STEPS, UNSTICK_STEPS } from './full';

const quick = (steps: Step[]): Step[] =>
  steps.map((s) => ({
    ...s,
    holdMs: Math.min(s.holdMs ?? 700, s.id === 'focus.fast' ? 4000 : 900),
    action: s.action.kind === 'type' ? { ...s.action, cps: 35 } : s.action,
  }));

export const PITCH: Script = {
  id: 'pitch',
  chapters: CHAPTERS.filter((c) => ['name', 'lighter', 'unstick', 'switch', 'patterns', 'shore'].includes(c.id)),
  steps: [
    ...quick(CHECKIN_STEPS),
    ...quick(LIGHTER_STEPS),
    ...quick(UNSTICK_STEPS),
    ...quick(SWITCH_STEPS),
    ...quick(PATTERN_STEPS),
    ...quick(SHORE_STEPS),
    { id: 'pitch.close', chapter: 'shore', action: { kind: 'say' }, caption: 'Tide plans for the brain you have right now.', narrate: true, holdMs: 2500 },
  ],
};
