// "How does Maya feel right now?" for suggestions: her latest check-in from
// the last six hours, or nothing. An old check-in shouldn't decide today's
// first step, and check-ins where the safety layer fired are never used.
import { db } from './db';
import { HOUR } from './time';
import type { CheckIn } from './types';

export const RECENT_STATE_HOURS = 6;

export async function recentCheckIn(nowTs: number): Promise<CheckIn | undefined> {
  // Open-ended range with the cut-off as a filter, so live queries that call
  // this still notice a check-in saved after they first ran.
  return db.checkins
    .where('ts')
    .aboveOrEqual(nowTs - RECENT_STATE_HOURS * HOUR)
    .reverse()
    .filter((c) => !c.safetyTriggered && c.ts <= nowTs)
    .first();
}
