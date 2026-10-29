// "How does Maya feel right now?" for suggestions: her latest check-in from
// the last six hours, or nothing. An old check-in shouldn't decide today's
// first step, and check-ins where the safety layer fired are never used.
import { db } from './db';
import { HOUR } from './time';
import type { CheckIn } from './types';

export const RECENT_STATE_HOURS = 6;

export async function recentCheckIn(nowTs: number): Promise<CheckIn | undefined> {
  return db.checkins
    .where('ts')
    .between(nowTs - RECENT_STATE_HOURS * HOUR, nowTs, true, true)
    .reverse()
    .filter((c) => !c.safetyTriggered)
    .first();
}
