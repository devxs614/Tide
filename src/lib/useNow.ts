'use client';

// The current time (demo-aware), with a redraw on a schedule: every minute
// for Today's "Now" marker, every 30 seconds for countdowns. It reads now()
// on every render rather than storing it, so a demo-clock jump in Settings
// shows up immediately instead of at the next tick.
import { useEffect, useState } from 'react';
import { now } from './clock';

export function useNow(intervalMs = 60_000): number {
  const [, redraw] = useState(0);
  useEffect(() => {
    const id = setInterval(() => redraw((n) => n + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now();
}
