// The month grid behind the calendar (v2.1 F-10): six weeks of seven days,
// starting on the person's first weekday, as ISO dates. Built from local
// calendar parts, so daylight-saving changes and leap years need no care.
import { fromISODate, toISODate } from '../time';

export type WeekStart = 'sunday' | 'monday';

export const firstWeekday = (start: WeekStart) => (start === 'monday' ? 1 : 0);

// Weekday numbers (0 = Sunday) in the order the header shows them.
export function weekdayOrder(start: WeekStart): number[] {
  const first = firstWeekday(start);
  return Array.from({ length: 7 }, (_, i) => (first + i) % 7);
}

// `month` is 0–11. The first row holds the 1st; 42 days in all.
export function monthGrid(year: number, month: number, start: WeekStart): string[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() - firstWeekday(start) + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => toISODate(new Date(year, month, 1 - lead + i).getTime()));
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function monthOf(iso: string): { year: number; month: number } {
  const d = new Date(fromISODate(iso));
  return { year: d.getFullYear(), month: d.getMonth() };
}

// "2026-11" style key for a month, and the month before or after.
export const monthKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;

export function shiftMonth(year: number, month: number, by: number): { year: number; month: number } {
  const d = new Date(year, month + by, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function shiftDay(iso: string, by: number): string {
  const d = new Date(fromISODate(iso));
  d.setDate(d.getDate() + by);
  return toISODate(d.getTime());
}
