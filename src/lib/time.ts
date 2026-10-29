// Small date helpers so every screen says times the same way ("3:40 pm",
// "Thursday, November 5", "Due tomorrow"). We format by hand instead of with
// Intl so the server, the browser and the tests always agree on the output.
// All "today" logic uses the device's local time zone.

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h < 12 ? 'am' : 'pm';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function weekdayName(ts: number): string {
  return WEEKDAYS[new Date(ts).getDay()];
}

export function shortWeekday(ts: number): string {
  return weekdayName(ts).slice(0, 3);
}

export function shortMonth(ts: number): string {
  return MONTHS[new Date(ts).getMonth()].slice(0, 3);
}

// "Thursday, November 5"
export function formatLongDate(ts: number): string {
  const d = new Date(ts);
  return `${weekdayName(ts)}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// "Tue, Oct 27"
export function formatShortDay(ts: number): string {
  return `${shortWeekday(ts)}, ${shortMonth(ts)} ${new Date(ts).getDate()}`;
}

// "Thu 3:40 pm" — the compact form the label prompt receives as localTime.
export function localTimeLabel(ts: number): string {
  return `${shortWeekday(ts)} ${formatTime(ts)}`;
}

export function toISODate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function fromISODate(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

// Calendar-day arithmetic that survives daylight-saving changes, unlike
// adding 24 hours of milliseconds.
export function addDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function isSameDay(a: number, b: number): boolean {
  return toISODate(a) === toISODate(b);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((fromISODate(toIso) - fromISODate(fromIso)) / DAY);
}

// Due text without judgement: a date in the past is just shown as a date,
// never as "overdue".
export function dueLabel(due: string, nowTs: number): string {
  const today = toISODate(nowTs);
  const diff = daysBetween(today, due);
  const dueTs = fromISODate(due);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff > 1 && diff < 7) return `Due ${shortWeekday(dueTs)}`;
  return `Due ${shortMonth(dueTs)} ${new Date(dueTs).getDate()}`;
}

// Whole minutes until a moment, rounded up so "in 1 min" shows until it's
// actually time, never "in 0 min".
export function minutesUntil(ts: number, nowTs: number): number {
  return Math.max(0, Math.ceil((ts - nowTs) / MINUTE));
}

export type DayPart = 'morning' | 'afternoon' | 'evening';

export function dayPart(ts: number): DayPart {
  const h = new Date(ts).getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

// "9:41" for the focus timer and the strategy timers.
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// "Today", "Yesterday", or "Tue, Oct 27" for grouping lists by day.
export function relativeDayLabel(ts: number, nowTs: number): string {
  const diff = daysBetween(toISODate(ts), toISODate(nowTs));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return formatShortDay(ts);
}
