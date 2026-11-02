// The rules behind "Try a look" (v2.1 F-11): what gets saved before the
// first try, so "Back to my look" restores it exactly, and the order of
// "Surprise me": a shuffle that's the same all day, so repeated taps go
// through every look before one comes back.
import { LOOKS, type LookId } from '@/data/looks';
import type { Settings } from './types';

// Every key any look changes. The snapshot holds the person's own values
// for all of them, whichever look is tried.
export const LOOK_KEYS = [...new Set(LOOKS.flatMap((l) => Object.keys(l.values)))] as Array<keyof Settings>;

export interface LookSnapshot {
  values: Partial<Settings>;
  trying: LookId;
  cursor?: number;
}

export function snapshotOf(settings: Settings): Partial<Settings> {
  return Object.fromEntries(LOOK_KEYS.map((k) => [k, settings[k]])) as Partial<Settings>;
}

// FNV-1a of the date: a seed that changes once a day.
function seed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

export function surpriseOrder(day: string): LookId[] {
  const ids = LOOKS.map((l) => l.id);
  let s = seed(day);
  for (let i = ids.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) >>> 0;
    const j = s % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

// The next look after `cursor` that isn't the one on screen.
export function nextSurprise(order: LookId[], cursor: number, current: LookId | null): { id: LookId; cursor: number } {
  for (let step = 1; step <= order.length; step++) {
    const at = (cursor + step) % order.length;
    if (order[at] !== current) return { id: order[at], cursor: at };
  }
  return { id: order[0], cursor: 0 };
}
