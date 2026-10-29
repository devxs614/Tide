'use client';

// The switch coming up in the next 15 minutes, if any, with the numbers for
// "has felt hard 3 of the last 4 times" when they clear the pattern bar.
// It re-checks every 30 seconds (the caller's clock), so the card appears on
// its own as the time comes, including on the demo clock.
import { useLiveQuery } from 'dexie-react-hooks';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { getUpcomingTransition, type UpcomingTransition } from '@/lib/bridge';
import { loadPatternInput } from '@/lib/patterns/data';
import { hardSwitchFor } from '@/lib/patterns/rules/hardTransition';
import { DAY } from '@/lib/time';

export interface UpcomingBridge extends UpcomingTransition {
  fromKind: string;
  hard: { k: number; n: number } | null;
}

export function useUpcomingBridge(nowTs: number): UpcomingBridge | null | undefined {
  const bucket = Math.floor(nowTs / 30_000);
  return useLiveQuery(async () => {
    const at = now();
    const [events, transitions, tasks] = await Promise.all([
      db.events.where('start').between(at - DAY, at + DAY, true, true).toArray(),
      db.transitions.toArray(),
      db.tasks.where('status').equals('in_progress').toArray(),
    ]);
    const upcoming = getUpcomingTransition(at, events, transitions, tasks);
    if (!upcoming) return null;
    const fromKind = upcoming.fromEvent?.kind ?? 'task';
    const hard = hardSwitchFor(await loadPatternInput(at, 28), fromKind, upcoming.to.kind);
    return { ...upcoming, fromKind, hard };
  }, [bucket]);
}
