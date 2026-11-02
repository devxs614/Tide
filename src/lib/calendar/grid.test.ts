// The calendar's date math (v2.1 F-10, spec 14.8): grids for months that
// start on every weekday with both week starts, leap years, and weekly
// repeats (weekday sets, the until date, the 26-week and 182 caps).
import { describe, expect, it } from 'vitest';
import { daysInMonth, monthGrid, shiftMonth, weekdayOrder } from './grid';
import { defaultUntil, MAX_INSTANCES, weeklyDates } from './repeat';

const dow = (iso: string) => new Date(`${iso}T12:00:00`).getDay();

describe('month grid', () => {
  it('starts on the right weekday and holds the whole month, for every starting weekday', () => {
    // 2026 has months starting on every weekday.
    for (let month = 0; month < 12; month++) {
      for (const start of ['sunday', 'monday'] as const) {
        const grid = monthGrid(2026, month, start);
        expect(grid).toHaveLength(42);
        expect(dow(grid[0])).toBe(start === 'monday' ? 1 : 0);
        const inMonth = grid.filter((d) => d.startsWith(`2026-${String(month + 1).padStart(2, '0')}`));
        expect(inMonth).toHaveLength(daysInMonth(2026, month));
        expect(grid.indexOf(inMonth[0])).toBeLessThan(7);
      }
    }
  });

  it('knows leap years', () => {
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2100, 1)).toBe(28);
    expect(monthGrid(2028, 1, 'monday')).toContain('2028-02-29');
  });

  it('orders the weekday row and moves across years', () => {
    expect(weekdayOrder('monday')).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe('weekly repeats', () => {
  it('lists each chosen weekday through the until date', () => {
    // Tue Nov 3 through Thu Nov 19, Tue and Thu.
    expect(weeklyDates('2026-11-03', [2, 4], '2026-11-19')).toEqual(['2026-11-03', '2026-11-05', '2026-11-10', '2026-11-12', '2026-11-17', '2026-11-19']);
    expect(defaultUntil('2026-11-03')).toBe('2026-12-28');
  });

  it('stops at 26 weeks and at 182 instances', () => {
    const everyDay = weeklyDates('2026-11-01', [0, 1, 2, 3, 4, 5, 6], '2030-01-01');
    expect(everyDay).toHaveLength(MAX_INSTANCES);
    expect(everyDay.at(-1)).toBe('2027-05-01');
  });
});
