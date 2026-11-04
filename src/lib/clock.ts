// The one place in Tide that reads the system clock.
// Normally now() is just the real time. In demo mode the app pretends it is
// Thursday, November 5 at 3:40 pm and lets time run forward at normal speed
// from the moment the demo started, so the stage demo always lands on the
// same afternoon. Everything else calls now(), never Date.now().
import type { DemoClock } from './types';

// Built from local parts on purpose: a laptop set to Arizona time still shows
// 3:40 pm with the lab and calculus events at the right local hours.
export const DEMO_START = new Date(2026, 10, 5, 15, 40, 0, 0).getTime();

let demoClock: DemoClock | null = null;
// The clock as it was saved, which settings hand back on every render.
let saved: DemoClock | null = null;

// Only a clock that differs from the saved one (a jump, a restart) replaces
// the running one. Settings pass the same saved clock in on every render,
// and before the demo fix pack that undid any speed change made since: a
// tour paused at 0× jumped back to the saved moment, and at the focus
// fast-forward's 400× the whole time since the save was multiplied (D-5).
// Outside the demo there is no demo clock, so nothing here changes.
export function setDemoClock(clock: DemoClock | null): void {
  if (clock && saved && clock.base === saved.base && clock.startedAt === saved.startedAt) return;
  saved = clock;
  demoClock = clock;
}

export function realNow(): number {
  return Date.now();
}

// v2 (spec 16.3): the demo can run time faster for a moment (a focus block
// at 60×) or jump to a moment. Both only matter while a demo clock is set,
// so outside the demo time is real, exactly as in v1.
let speed = 1;

export function now(): number {
  if (!demoClock) return Date.now();
  return demoClock.base + (Date.now() - demoClock.startedAt) * speed;
}

export function setDemoSpeed(multiplier: number): void {
  if (demoClock) demoClock = { base: now(), startedAt: Date.now() };
  speed = multiplier;
}

export function demoSpeed(): number {
  return speed;
}

// A demo clock that reads `base` right now, for "Restart demo" and the
// rehearsal jumps in Settings.
export function demoClockAt(base: number): DemoClock {
  return { base, startedAt: Date.now() };
}
