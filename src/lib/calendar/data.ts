// What the calendar shows (v2.1 F-10): per day of a month, its events,
// how many tasks are due, check-in states and whether the day was closed;
// and everything about one day for the day view. Each is read once per
// range and grouped in JavaScript. Tasks and events come through the repo
// helpers, so deleted ones never appear.
import { db } from '../db';
import { endOfDay, fromISODate, toISODate } from '../time';
import { eventsBetween } from '../repo/eventQueries';
import { activeTasks, tasksDueBetween } from '../repo/taskQueries';
import type { CalendarEvent, CheckIn, DayWrap, Quadrant, StrategyUse, Task, Win } from '../types';

export interface DaySummary {
  events: CalendarEvent[];
  tasksDue: number;
  quadrants: Quadrant[];
  closed: boolean;
}

const empty = (): DaySummary => ({ events: [], tasksDue: 0, quadrants: [], closed: false });

export async function loadMonth(first: string, last: string): Promise<Record<string, DaySummary>> {
  const from = fromISODate(first);
  const to = endOfDay(fromISODate(last));
  const [events, tasks, checkins, wraps] = await Promise.all([
    eventsBetween(from, to),
    tasksDueBetween(first, last),
    db.checkins.where('ts').between(from, to, true, true).toArray(),
    db.dayWraps.where('date').between(first, last, true, true).toArray(),
  ]);
  const days: Record<string, DaySummary> = {};
  const day = (iso: string) => (days[iso] ??= empty());
  for (const e of events) day(toISODate(e.start)).events.push(e);
  for (const t of tasks) if (t.status !== 'done') day(t.due!).tasksDue += 1;
  for (const c of checkins) if (!c.safetyTriggered) day(toISODate(c.ts)).quadrants.push(c.quadrant);
  for (const w of wraps) if (w.completedAt) day(w.date).closed = true;
  return days;
}

export interface DayDetail {
  events: CalendarEvent[];
  due: Task[];
  snoozed: Task[];
  finished: Task[];
  checkins: CheckIn[];
  wins: Win[];
  strategies: StrategyUse[];
  wrap: DayWrap | undefined;
}

export async function loadDay(iso: string): Promise<DayDetail> {
  const from = fromISODate(iso);
  const to = endOfDay(from);
  const inDay = (ts?: number) => ts !== undefined && ts >= from && ts <= to;
  const [events, tasks, checkins, wins, strategies, wrap] = await Promise.all([
    eventsBetween(from, to),
    activeTasks(),
    db.checkins.where('ts').between(from, to, true, true).sortBy('ts'),
    db.wins.where('ts').between(from, to, true, true).sortBy('ts'),
    db.strategyUses.where('ts').between(from, to, true, true).sortBy('ts'),
    db.dayWraps.get(iso),
  ]);
  return {
    events,
    due: tasks.filter((t) => t.due === iso && t.status !== 'done'),
    snoozed: tasks.filter((t) => t.snoozedUntil === iso && t.status !== 'done'),
    finished: tasks.filter((t) => t.status === 'done' && inDay(t.doneAt)),
    checkins: checkins.filter((c) => !c.safetyTriggered),
    wins,
    strategies: strategies.filter((u) => !u.cancelled),
    wrap,
  };
}
