// How sure Tide is about a pattern, from how many times it was seen. It is
// shown as dots plus "Confidence 2 of 4", so three observations never look
// as solid as twelve.
import { DAY } from '@/lib/time';

export function confidenceFor(n: number): 1 | 2 | 3 | 4 {
  if (n >= 12) return 4;
  if (n >= 8) return 3;
  if (n >= 5) return 2;
  return 1;
}

// True if a record's time falls in the window that ends now: the last 7 or
// 28 days, never anything in the future (the demo clock can be rewound).
export function inWindow(ts: number, now: number, windowDays: number): boolean {
  return ts > now - windowDays * DAY && ts <= now;
}

export function pct(rate: number): number {
  return Math.round(rate * 100);
}
