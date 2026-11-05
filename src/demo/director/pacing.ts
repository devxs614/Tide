// How long each step of the tour stays up (demo fix pack, D-3). Before, the
// rule was a second plus 50 ms a character, divided by the speed, and the
// pitch cut capped every hold at 0.9 s, so at 2× a caption could be gone in
// under two seconds. Now every caption gets at least its reading time, from
// the moment the screen has settled, and narration can make it longer.
import type { Step } from './types';

// The spec's formula: 1.8 s plus 55 ms a character, between 2.5 and 9 s.
export function readingTime(caption: string): number {
  return Math.min(9000, Math.max(2500, 1800 + 55 * [...caption].length));
}

// What a step holds once its action is done, before narration. Speeding the
// tour up shortens the holds for looking, but reading only up to 1.25×:
// text doesn't get faster to read because the tour is in a hurry.
export function stepHold(step: Step, speed: number): number {
  if (!step.caption) return Math.max(step.holdMs ?? 0, 600) / speed;
  return Math.max((step.holdMs ?? 0) / speed, readingTime(step.caption) / Math.min(speed, 1.25));
}

// Typing keeps each step's speed but never goes past 18 characters a second
// at 1×, so the words can be followed as they appear.
export const MAX_CPS = 18;

export function msPerChar(cps: number | undefined, speed: number): number {
  return 1000 / Math.min(cps ?? 22, MAX_CPS) / speed;
}

// The pointer's glide to a tap, and the ripple after it.
export const CURSOR_GLIDE_MS = 500;
export const CURSOR_TAP_MS = 300;
