import { describe, expect, it } from 'vitest';
import { getPendingRating, getUpcomingTransition } from './bridge';
import { HOUR, MINUTE } from './time';
import type { CalendarEvent, Task, Transition } from './types';

const NOW = new Date(2026, 10, 5, 16, 41).getTime();
const lab: CalendarEvent = { id: 'lab', title: 'Chemistry lab', kind: 'lab', start: new Date(2026, 10, 5, 14).getTime(), end: new Date(2026, 10, 5, 16, 40).getTime() };
const calc: CalendarEvent = { id: 'calc', title: 'Calculus', kind: 'class', start: new Date(2026, 10, 5, 16, 50).getTime(), end: new Date(2026, 10, 5, 18, 20).getTime() };
const report: Task = { id: 'r', title: 'Chemistry lab report', type: 'writing', energyCost: 3, status: 'in_progress', createdAt: 0, startedAt: 1, order: 0 };

describe('getUpcomingTransition', () => {
  it('bridges from the lab that just ended to calculus in 9 minutes', () => {
    const t = getUpcomingTransition(NOW, [lab, calc], [], [report])!;
    expect(t.to.id).toBe('calc');
    expect(t.fromEvent?.id).toBe('lab');
    expect(t.fromTask?.id).toBe('r');
    expect(t.minutesUntil).toBe(9);
  });

  it('comes from the task when no event is near, and stays quiet once bridged or too early', () => {
    expect(getUpcomingTransition(NOW, [calc], [], [report])?.fromEvent).toBeUndefined();
    expect(getUpcomingTransition(NOW, [lab, calc], [{ id: 't', ts: NOW, toEventId: 'calc' }], [])).toBeNull();
    expect(getUpcomingTransition(NOW - 30 * MINUTE, [lab, calc], [], [])).toBeNull();
  });
});

describe('getPendingRating', () => {
  const t: Transition = { id: 't', ts: NOW, toEventId: 'calc' };
  it('asks only once the next event has been going for 10 minutes', () => {
    expect(getPendingRating(calc.start + 9 * MINUTE, [t], [calc])).toBeNull();
    expect(getPendingRating(calc.start + 10 * MINUTE, [t], [calc])?.id).toBe('t');
  });
  it('never asks twice or about switches more than a day old', () => {
    expect(getPendingRating(calc.start + HOUR, [{ ...t, rating: 'easy' }], [calc])).toBeNull();
    expect(getPendingRating(calc.start + 25 * HOUR, [t], [calc])).toBeNull();
  });
});
