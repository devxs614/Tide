'use client';

// Only one companion animates its loops at a time (v2 spec 5.6): if a toast
// head and the Today header are both on screen, only the bigger one breathes
// and blinks; the other holds still. Each animated figure registers its size
// here, and the largest (first to register, on a tie) gets to loop.
import { useEffect, useSyncExternalStore } from 'react';

const sizes = new Map<string, number>();
const listeners = new Set<() => void>();
let snapshot = '';

function notify() {
  let best = '';
  let bestSize = -1;
  for (const [id, size] of sizes) {
    if (size > bestSize) {
      best = id;
      bestSize = size;
    }
  }
  snapshot = best;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLoopPermission(id: string, size: number, active: boolean): boolean {
  useEffect(() => {
    if (!active) return;
    sizes.set(id, size);
    notify();
    return () => {
      sizes.delete(id);
      notify();
    };
  }, [id, size, active]);
  const leader = useSyncExternalStore(subscribe, () => snapshot, () => '');
  return !active || leader === '' || leader === id;
}
