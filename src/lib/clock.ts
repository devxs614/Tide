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

export function setDemoClock(clock: DemoClock | null): void {
  demoClock = clock;
}

export function getDemoClock(): DemoClock | null {
  return demoClock;
}

export function realNow(): number {
  return Date.now();
}

export function now(): number {
  if (!demoClock) return Date.now();
  return demoClock.base + (Date.now() - demoClock.startedAt);
}

// A demo clock that reads `base` right now, for "Restart demo" and the
// rehearsal jumps in Settings.
export function demoClockAt(base: number): DemoClock {
  return { base, startedAt: Date.now() };
}
