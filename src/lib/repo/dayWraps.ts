// Close the day records (v2 spec 14, 18.3). A wrap is saved after every
// step, so closing the app and coming back resumes where Maya stopped. A
// wrap started after midnight but before her day starts belongs to the day
// before: 1 am is still "tonight".
import { db } from '../db';
import { now } from '../clock';
import { addDays, toISODate } from '../time';
import type { DayWrap } from '../types';
import { addWin } from './wins';

export function wrapDateFor(nowTs: number, dayStart: string): string {
  const [h, m] = dayStart.split(':').map(Number);
  const d = new Date(nowTs);
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes < h * 60 + (m || 0) ? toISODate(addDays(nowTs, -1)) : toISODate(nowTs);
}

export function getWrap(date: string): Promise<DayWrap | undefined> {
  return db.dayWraps.get(date);
}

// In one transaction, so two quick starts (a double tap, or React running
// an effect twice in development) can't both try to create the same day.
export function startWrap(date: string): Promise<DayWrap> {
  return db.transaction('rw', db.dayWraps, async () => {
    const existing = await db.dayWraps.get(date);
    if (existing) return existing;
    const wrap: DayWrap = { date, startedAt: now(), step: 1, helped: [], hard: [], carryover: [] };
    await db.dayWraps.add(wrap);
    return wrap;
  });
}

export async function saveWrapStep(date: string, patch: Partial<DayWrap>): Promise<void> {
  await db.dayWraps.update(date, patch);
}

// Finishing adds the driftwood (a wrap win), once per day.
export async function completeWrap(date: string, winText: string): Promise<void> {
  await db.transaction('rw', db.dayWraps, db.wins, async () => {
    const wrap = await db.dayWraps.get(date);
    if (!wrap || wrap.completedAt) return;
    await db.dayWraps.update(date, { completedAt: now() });
    await addWin(winText, 'manual', date, 'wrap');
  });
}

export function listWraps(fromDate: string, toDate: string): Promise<DayWrap[]> {
  return db.dayWraps.where('date').between(fromDate, toDate, true, true).toArray();
}
