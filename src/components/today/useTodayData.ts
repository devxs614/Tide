'use client';

// Everything Today shows, read live from the device in one query: tasks,
// today's events, today's plan and today's latest check-in. "Today" comes
// from now(), so in demo mode it is Thursday, November 5.
import { useLiveQuery } from 'dexie-react-hooks';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { endOfDay } from '@/lib/time';
import type { CalendarEvent, CheckIn, DayPlan, Task } from '@/lib/types';

export interface TodayData {
  tasks: Task[];
  events: CalendarEvent[];
  plan: DayPlan | undefined;
  latest: CheckIn | null;
}

export function useTodayData(today: string, dayStart: number): TodayData | undefined {
  return useLiveQuery(async () => {
    const at = now();
    const [tasks, events, plan, latest] = await Promise.all([
      db.tasks.toArray(),
      db.events.where('start').between(dayStart, endOfDay(dayStart), true, true).sortBy('start'),
      db.dayPlans.get(today),
      // Open-ended on purpose: Dexie only re-runs a live query for changes
      // inside the range it read, so a range ending at "now" would miss the
      // check-in Maya saves a minute later. The time cut-off is a filter.
      db.checkins
        .where('ts')
        .aboveOrEqual(dayStart)
        .reverse()
        .filter((c) => !c.safetyTriggered && c.ts <= at)
        .first(),
    ]);
    return { tasks, events, plan, latest: latest ?? null };
  }, [today, dayStart]);
}
