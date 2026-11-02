// Reads everything the pattern engine needs from the device in one go.
// Check-ins where the safety layer fired are left out here, once, so no rule
// can accidentally learn from them.
import { db } from '@/lib/db';
import type { PatternInput } from './types';
import { allTasksForPatterns } from '../repo/taskQueries';
import { allEventsForPatterns } from '../repo/eventQueries';

export async function loadPatternInput(now: number, windowDays: 7 | 28 = 28): Promise<PatternInput> {
  const [checkins, tasks, events, focusBlocks, strategyUses, transitions, dismissed, dayWraps] = await Promise.all([
    db.checkins.toArray(),
    allTasksForPatterns(),
    allEventsForPatterns(),
    db.focusBlocks.toArray(),
    db.strategyUses.toArray(),
    db.transitions.toArray(),
    db.dismissedPatterns.toArray(),
    db.dayWraps.toArray(),
  ]);
  return {
    now,
    windowDays,
    checkins: checkins.filter((c) => !c.safetyTriggered),
    tasks,
    events,
    focusBlocks,
    // Cancelled uses (v2.1 F-08) are history, not evidence: no rule counts them.
    strategyUses: strategyUses.filter((u) => !u.cancelled),
    transitions,
    dismissedKeys: new Set(dismissed.map((d) => d.key)),
    dayWraps: dayWraps.filter((w) => w.completedAt),
  };
}
