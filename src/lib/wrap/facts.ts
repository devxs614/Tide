// What Close the day knows about a day (v2 spec 14.4, 14.6): the check-ins,
// what got done, the switches and strategies, the loose ends, and tomorrow's
// first events. It also builds the input for /api/ai/wrapup, which gets
// counts, titles and the labels Maya chose, never her own notes.
import { strategyName } from '@/data/strategies';
import { db } from '@/lib/db';
import type { WrapupInputT } from '@/lib/ai/schemas';
import { addDays, formatTime, toISODate } from '@/lib/time';
import type { CalendarEvent, CheckIn, CommunicationMode, DayWrap, FocusBlock, StrategyUse, Task, Transition } from '@/lib/types';

export interface DayFacts {
  date: string;
  checkins: CheckIn[];
  tasksDone: Task[];
  focusBlocks: FocusBlock[];
  transitions: Array<Transition & { label: string }>;
  strategies: StrategyUse[];
  looseEnds: Task[];
  tomorrowEvents: CalendarEvent[];
}

// The span of one date, from local midnight to the next.
function dayRange(date: string): [number, number] {
  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d).getTime();
  return [start, addDays(start, 1)];
}

export async function loadDayFacts(date: string): Promise<DayFacts> {
  const [start, end] = dayRange(date);
  const inDay = (ts?: number) => ts !== undefined && ts >= start && ts < end;
  const [checkins, tasks, focusBlocks, transitions, strategies, events] = await Promise.all([
    db.checkins.where('ts').between(start, end).filter((c) => !c.safetyTriggered).sortBy('ts'),
    db.tasks.toArray(),
    db.focusBlocks.where('ts').between(start, end).toArray(),
    db.transitions.where('ts').between(start, end).toArray(),
    db.strategyUses.where('ts').between(start, end).toArray(),
    db.events.where('start').between(end, addDays(end, 1)).sortBy('start'),
  ]);
  const titles = new Map((await db.events.toArray()).map((e) => [e.id, e.title]));
  const plan = await db.dayPlans.get(date);
  const kept = new Set(plan?.keptTaskIds ?? []);
  return {
    date,
    checkins,
    tasksDone: tasks.filter((t) => inDay(t.doneAt)),
    focusBlocks,
    transitions: transitions.map((t) => ({ ...t, label: `${(t.fromEventId && titles.get(t.fromEventId)) || 'Before'} → ${titles.get(t.toEventId) ?? 'next'}` })),
    strategies,
    // Not done, not set aside, and part of today: due by today, kept in
    // today's plan, in progress or stuck (spec 14.4, step 8).
    looseEnds: tasks.filter(
      (t) => t.status !== 'done' && !t.someday && (kept.has(t.id) || t.status === 'in_progress' || t.status === 'stuck' || (t.due !== undefined && t.due <= date)),
    ),
    tomorrowEvents: events,
  };
}

// "Later this week": the next weekday at least two days away.
export function laterThisWeek(date: string): string {
  const [start] = dayRange(date);
  let ts = addDays(start, 2);
  while ([0, 6].includes(new Date(ts).getDay())) ts = addDays(ts, 1);
  return toISODate(ts);
}

export function tomorrowOf(date: string): string {
  return toISODate(addDays(dayRange(date)[0], 1));
}

export function wrapupInput(
  facts: DayFacts,
  wrap: DayWrap,
  labels: { helped: string[]; hard: string[] },
  extra: { mode: CommunicationMode; readingLevel: 'standard' | 'simple'; anchorTitle: string | null; patternHint: string | null; companionName: string | null },
): WrapupInputT {
  return {
    mode: extra.mode,
    readingLevel: extra.readingLevel,
    date: facts.date,
    facts: {
      checkins: facts.checkins.slice(-8).map((c) => ({ time: formatTime(c.ts), quadrant: c.quadrant, emotions: c.emotions.slice(0, 2) })),
      tasksDone: facts.tasksDone.slice(0, 12).map((t) => t.title.slice(0, 120)),
      focusBlocks: { total: facts.focusBlocks.length, gotGoing: facts.focusBlocks.filter((b) => b.outcome === 'got_going').length },
      transitions: facts.transitions.slice(0, 8).map((t) => ({ label: t.label.slice(0, 80), rating: t.rating ?? null })),
      strategies: facts.strategies.slice(0, 8).map((s) => ({ name: strategyName(s.strategyId), result: s.result ?? null })),
    },
    reflection: { helped: labels.helped.slice(0, 10), hard: labels.hard.slice(0, 10), overall: wrap.overall ?? null },
    tomorrow: {
      anchorTaskTitle: extra.anchorTitle?.slice(0, 120) ?? null,
      firstEventTitle: facts.tomorrowEvents[0]?.title.slice(0, 80) ?? null,
      patternHint: extra.patternHint ? { text: extra.patternHint.slice(0, 140) } : null,
    },
    companionName: extra.companionName,
  };
}
