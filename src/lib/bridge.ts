// When does a Bridge appear, and between what? The next event that starts
// within 15 minutes and hasn't been bridged yet. "From" is the event Maya is
// in (or just left, up to 15 minutes ago: at 4:41 the lab has only just
// ended), else the task she was most recently working on, else "what you're
// doing". Also: which past switch is waiting for a rating.
import { HOUR, MINUTE } from './time';
import type { CalendarEvent, Task, Transition } from './types';

export const BRIDGE_LEAD = 15 * MINUTE;
export const RATING_DELAY = 10 * MINUTE;

export interface UpcomingTransition {
  to: CalendarEvent;
  fromEvent?: CalendarEvent;
  fromTask?: Task;
  minutesUntil: number;
}

export function getUpcomingTransition(nowTs: number, events: CalendarEvent[], transitions: Transition[], tasks: Task[]): UpcomingTransition | null {
  const bridged = new Set(transitions.map((t) => t.toEventId));
  const to = events
    .filter((e) => e.start > nowTs && e.start - nowTs <= BRIDGE_LEAD && !bridged.has(e.id))
    .sort((a, b) => a.start - b.start)[0];
  if (!to) return null;
  return { to, ...resolveFrom(nowTs, events, tasks, to), minutesUntil: Math.max(1, Math.ceil((to.start - nowTs) / MINUTE)) };
}

export function resolveFrom(nowTs: number, events: CalendarEvent[], tasks: Task[], to: CalendarEvent) {
  const fromEvent = events
    .filter((e) => e.id !== to.id && e.start <= nowTs && e.end > nowTs - BRIDGE_LEAD && e.start < to.start)
    .sort((a, b) => b.start - a.start)[0];
  const fromTask = tasks
    .filter((t) => t.status === 'in_progress')
    .sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))[0];
  return { fromEvent, fromTask };
}

export function fromTitle(t: Pick<UpcomingTransition, 'fromEvent' | 'fromTask'>, fallback: string): string {
  return t.fromEvent?.title ?? t.fromTask?.title ?? fallback;
}

// The most recent switch that isn't rated yet, once its event has been
// going for 10 minutes. Very old ones (over a day) are left alone.
export function getPendingRating(nowTs: number, transitions: Transition[], events: CalendarEvent[]): Transition | null {
  const byId = new Map(events.map((e) => [e.id, e]));
  return (
    transitions
      .filter((t) => {
        const to = byId.get(t.toEventId);
        return !t.rating && to && nowTs >= to.start + RATING_DELAY && nowTs - to.start < 24 * HOUR;
      })
      .sort((a, b) => b.ts - a.ts)[0] ?? null
  );
}

// Plain words for event kinds in the "has felt hard" line.
export const KIND_WORDS: Record<string, string> = {
  class: 'class',
  lab: 'lab',
  work: 'work',
  social: 'social plans',
  self_care: 'self-care',
  other: 'something else',
  task: 'a task',
};
