// Date and time wording across the app. The due-date test exists because
// Tide never calls anything overdue.
import { describe, expect, it } from 'vitest';
import {
  addDays,
  dayPart,
  dueLabel,
  formatCountdown,
  formatShortDay,
  formatTime,
  localTimeLabel,
  minutesUntil,
  relativeDayLabel,
  toISODate,
} from './time';

const thu = new Date(2026, 10, 5, 15, 40).getTime();

describe('time helpers', () => {
  it('formats times the way the spec writes them', () => {
    expect(formatTime(thu)).toBe('3:40 pm');
    expect(formatTime(new Date(2026, 10, 5, 0, 5).getTime())).toBe('12:05 am');
    expect(formatTime(new Date(2026, 10, 5, 12, 0).getTime())).toBe('12:00 pm');
    expect(localTimeLabel(thu)).toBe('Thu 3:40 pm');
    expect(formatShortDay(new Date(2026, 9, 27).getTime())).toBe('Tue, Oct 27');
  });

  it('describes due dates without ever calling them overdue', () => {
    expect(dueLabel('2026-11-05', thu)).toBe('Due today');
    expect(dueLabel('2026-11-06', thu)).toBe('Due tomorrow');
    expect(dueLabel('2026-11-09', thu)).toBe('Due Mon');
    expect(dueLabel('2026-11-03', thu)).toBe('Due Nov 3');
    expect(dueLabel('2026-12-01', thu)).toBe('Due Dec 1');
  });

  it('rounds minutes up so a countdown never says 0 before it is time', () => {
    expect(minutesUntil(thu + 70 * 60_000, thu)).toBe(70);
    expect(minutesUntil(thu + 30_000, thu)).toBe(1);
    expect(minutesUntil(thu - 30_000, thu)).toBe(0);
  });

  it('handles calendar days, greetings and countdowns', () => {
    expect(toISODate(addDays(thu, 1))).toBe('2026-11-06');
    expect(dayPart(thu)).toBe('afternoon');
    expect(dayPart(new Date(2026, 10, 5, 9).getTime())).toBe('morning');
    expect(dayPart(new Date(2026, 10, 5, 19).getTime())).toBe('evening');
    expect(formatCountdown(9 * 60_000 + 41_000)).toBe('9:41');
    expect(relativeDayLabel(addDays(thu, -1), thu)).toBe('Yesterday');
  });
});
