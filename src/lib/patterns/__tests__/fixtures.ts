// Small builders for pattern-engine tests: records placed a given number of
// days before a fixed "now", so every test reads like the situation it
// describes ("five walks before writing, four got going").
import { DAY, MINUTE } from '@/lib/time';
import type { CalendarEvent, CheckIn, FocusBlock, FocusOutcome, Quadrant, RecheckResult, StrategyUse, Task, TaskType, Transition, TransitionRating } from '@/lib/types';
import type { PatternInput } from '../types';

export const NOW = new Date(2026, 10, 5, 15, 40).getTime();
let seq = 0;
const id = (p: string) => `${p}-${++seq}`;

export function input(over: Partial<PatternInput> = {}): PatternInput {
  return {
    now: NOW,
    windowDays: 28,
    checkins: [],
    tasks: [],
    events: [],
    focusBlocks: [],
    strategyUses: [],
    transitions: [],
    dismissedKeys: new Set(),
    ...over,
  };
}

export function task(type: TaskType): Task {
  return { id: id('task'), title: `${type} task`, type, energyCost: 2, status: 'done', createdAt: 0, order: 0 };
}

export function block(t: Task, ts: number, outcome: FocusOutcome): FocusBlock {
  return { id: id('fb'), taskId: t.id, ts, minutes: 10, completed: true, outcome };
}

export function strategyUse(strategyId: string, ts: number, result?: RecheckResult): StrategyUse {
  return { id: id('use'), strategyId, ts, context: 'toolkit', result };
}

export function checkIn(quadrant: Quadrant, ts: number, safetyTriggered = false): CheckIn {
  const coords = { surge: [3, -3], swell: [3, 3], ebb: [-3, -3], still: [-3, 3] }[quadrant];
  return { id: id('ci'), ts, emotions: [], energy: coords[0], pleasantness: coords[1], quadrant, aiUsed: false, safetyTriggered };
}

// A strategy, then a focus block on `t` 5 minutes later, `daysAgo` days ago.
export function strategyThenBlock(strategyId: string, t: Task, daysAgo: number, outcome: FocusOutcome) {
  const ts = NOW - daysAgo * DAY;
  return { use: strategyUse(strategyId, ts), block: block(t, ts + 5 * MINUTE, outcome) };
}

export function event(kind: CalendarEvent['kind'], start: number): CalendarEvent {
  return { id: id('ev'), title: kind, kind, start, end: start + 90 * MINUTE };
}

export function transition(from: CalendarEvent, to: CalendarEvent, rating: TransitionRating, strategyUseId?: string): Transition {
  return { id: id('tr'), ts: to.start - 10 * MINUTE, fromEventId: from.id, toEventId: to.id, rating, strategyUseId };
}
