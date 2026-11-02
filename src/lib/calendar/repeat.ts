// The dates of a weekly repeating event (v2.1 F-10, spec 14.5): every
// chosen weekday from the first date through "until", at most 26 weeks
// ahead and 182 instances, so a slip of the finger can't fill the database.
import { fromISODate, toISODate } from '../time';

export const DEFAULT_WEEKS = 8;
export const MAX_WEEKS = 26;
export const MAX_INSTANCES = 182;

export function defaultUntil(from: string): string {
  const d = new Date(fromISODate(from));
  d.setDate(d.getDate() + DEFAULT_WEEKS * 7 - 1);
  return toISODate(d.getTime());
}

export function latestUntil(from: string): string {
  const d = new Date(fromISODate(from));
  d.setDate(d.getDate() + MAX_WEEKS * 7 - 1);
  return toISODate(d.getTime());
}

export function weeklyDates(from: string, days: number[], until: string): string[] {
  const last = until > latestUntil(from) ? latestUntil(from) : until;
  const out: string[] = [];
  for (const d = new Date(fromISODate(from)); toISODate(d.getTime()) <= last && out.length < MAX_INSTANCES; d.setDate(d.getDate() + 1)) {
    if (days.includes(d.getDay())) out.push(toISODate(d.getTime()));
  }
  return out;
}
