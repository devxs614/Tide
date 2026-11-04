// The Tasks board's quick filters (v2.3 spec 5.3): due today, light
// energy and today's one thing, combined with AND. They last for this
// visit to Tide only, so nobody comes back days later to a board that looks
// half empty without knowing why. "Has steps" waits for the task
// breakdown feature, which isn't built yet (D207).
import { useSyncExternalStore } from 'react';
import type { Task } from '@/lib/types';

export type BoardFilter = 'dueToday' | 'light' | 'oneThing';
export const BOARD_FILTERS: BoardFilter[] = ['dueToday', 'light', 'oneThing'];

export function matchesFilters(task: Task, filters: BoardFilter[], today: string): boolean {
  return filters.every((f) => {
    if (f === 'dueToday') return task.due === today;
    if (f === 'light') return task.energyCost === 1;
    return task.anchorDate === today;
  });
}

// A tiny store outside React, so the filters survive moving between tabs
// in one visit and reset when Tide reloads.
let active: BoardFilter[] = [];
const listeners = new Set<() => void>();

export function toggleFilter(f: BoardFilter) {
  active = active.includes(f) ? active.filter((x) => x !== f) : [...active, f];
  listeners.forEach((l) => l());
}

export function clearFilters() {
  active = [];
  listeners.forEach((l) => l());
}

export function useBoardFilters(): BoardFilter[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => active,
    () => active,
  );
}
