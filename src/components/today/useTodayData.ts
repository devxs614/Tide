'use client';

// Everything Today shows, read live from the device in one query: tasks,
// today's events, today's plan and today's latest check-in. "Today" comes
// from now(), so in demo mode it is Thursday, November 5.
import { useLiveQuery } from 'dexie-react-hooks';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { endOfDay, HOUR } from '@/lib/time';
import type { CalendarEvent, CheckIn, DayPlan, Task } from '@/lib/types';
import { activeTasks } from '@/lib/repo/taskQueries';
import { eventsBetween } from '@/lib/repo/eventQueries';

export interface TodayData {
  tasks: Task[];
  events: CalendarEvent[];
  // Today's events plus the first hours after midnight, for the "Next" card:
  // at 11 pm a class at 12:30 am is still "in 90 min", not tomorrow's news.
  soon: CalendarEvent[];
  plan: DayPlan | undefined;
  latest: CheckIn | null;
}

export function useTodayData(today: string, dayStart: number): TodayData | undefined {
  return useLiveQuery(async () => {
    const at = now();
    const [tasks, events, plan, latest] = await Promise.all([
      activeTasks(),
      eventsBetween(dayStart, endOfDay(dayStart) + 3 * HOUR),
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
    const dayEnd = endOfDay(dayStart);
    return { tasks, events: events.filter((e) => e.start <= dayEnd), soon: events, plan, latest: latest ?? null };
  }, [today, dayStart]);
}
