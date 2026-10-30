// What the pattern engine produces and what it reads. A pattern is a plain
// counted fact about Maya's own records ("4 of 5 times"), never a guess, and
// it always carries the records it was counted from.
import type { CalendarEvent, CheckIn, DayWrap, FocusBlock, StrategyUse, Task, Transition } from '@/lib/types';

export type PatternKind = 'strategy_before_task' | 'hard_transition' | 'state_task_start' | 'strategy_effect' | 'wrap_helped';

// One line in "Why am I seeing this?": when it happened, what happened, and
// how it went, already in words.
export interface EvidenceRow {
  id: string;
  ts: number;
  label: string; // e.g. "3-minute walk → writing"
  outcome: string; // e.g. "Got going"
}

export interface PatternResult {
  key: string;
  kind: PatternKind;
  k: number; // successes (or hard count)
  n: number; // total observations
  rate: number; // k / n
  baselineRate?: number;
  confidence: 1 | 2 | 3 | 4;
  evidenceIds: string[];
  evidence: EvidenceRow[];
  facts: Record<string, string | number>; // exactly what narrate may use
}

export interface PatternInput {
  now: number;
  windowDays: 7 | 28;
  checkins: CheckIn[];
  tasks: Task[];
  events: CalendarEvent[];
  focusBlocks: FocusBlock[];
  strategyUses: StrategyUse[];
  transitions: Transition[];
  dismissedKeys: Set<string>;
  // v2 (spec 20), optional so v1 callers are unchanged: closed days, and
  // how many observations a rule needs before it speaks (never below 3).
  dayWraps?: DayWrap[];
  minEvidence?: number;
}
