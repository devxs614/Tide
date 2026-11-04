// The rules behind the smart check-in button (v2.3 Item 1), kept apart from
// the component so each can be tested on its own: where it shows, how
// scrolling hides and brings it back, and when it shrinks to its circle.
// The team found the always-on button covering cards and text, and showing
// on screens where checking in makes no sense.
import type { CheckIn, Quadrant } from '@/lib/types';
import { HOUR } from '@/lib/time';

// The main tabs and the calendar. Not on Settings, Focus, Wrap, the
// Studio, the Completed archive, the Shore's collection, Support or crisis.
export function fabShowsOn(pathname: string): boolean {
  if (['/', '/tasks', '/toolkit', '/patterns', '/shore'].includes(pathname)) return true;
  return pathname === '/calendar' || pathname.startsWith('/calendar/');
}

export interface ScrollState {
  lastY: number;
  hidden: boolean;
  // How far the page has moved since the direction last changed.
  run: number;
}

export const SCROLL_START: ScrollState = { lastY: 0, hidden: false, run: 0 };

// More than 24px down hides it; 12px up, the top or the bottom brings it
// back. Small jitters in between change nothing.
export function scrollStep(s: ScrollState, y: number, maxY: number): ScrollState {
  const dy = y - s.lastY;
  const run = Math.sign(dy) === Math.sign(s.run) ? s.run + dy : dy;
  if (y <= 0 || y >= maxY - 1) return { lastY: y, hidden: false, run: 0 };
  if (run > 24) return { lastY: y, hidden: true, run };
  if (run <= -12) return { lastY: y, hidden: false, run };
  return { lastY: y, hidden: s.hidden, run };
}

// Just the circle (its word becomes its name and a tooltip) at big text, in
// a narrow frame, while scrolling, or when something to press is under it.
export function fabCompact(opts: { textScale: number; frameWidth: number; scrolling: boolean; overInteractive: boolean }): boolean {
  return opts.textScale >= 1.3 || opts.frameWidth < 360 || opts.scrolling || opts.overInteractive;
}

// The ring shows the state of a check-in from the last six hours.
export function ringFor(latest: CheckIn | undefined, at: number): Quadrant | null {
  return latest && at - latest.ts <= 6 * HOUR ? latest.quadrant : null;
}
