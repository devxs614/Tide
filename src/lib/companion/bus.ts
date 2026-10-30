// A tiny typed event bus (v2 spec 8.9). The rest of Tide says what happened
// ("a check-in was saved in Ebb", "the AI is thinking", "a breath phase
// began") without knowing anything about companions; each CompanionHost
// listens and decides how its companion reacts.
import type { FocusOutcome, Quadrant, TaskType } from '@/lib/types';
import type { LineContext } from '@/copy/companions';
import type { BreathPhase } from '@/components/companion/CompanionFigure';

export type CelebrationTier = 'micro' | 'small' | 'big';

export type CompanionEvent =
  | { type: 'checkinSaved'; quadrant: Quadrant }
  | { type: 'aiLoading'; route: string }
  | { type: 'aiDone' }
  | { type: 'taskDone'; taskType: TaskType; wasStuck: boolean }
  | { type: 'focusStarted' }
  | { type: 'focusEnded'; outcome: FocusOutcome }
  | { type: 'bridgeOpened' }
  | { type: 'breathPhase'; phase: BreathPhase | null; ms?: number }
  | { type: 'celebrate'; tier: CelebrationTier; quadrant: Quadrant | null }
  | { type: 'shoreItem'; kind: string }
  | { type: 'wrapStarted' }
  | { type: 'wrapEnded' }
  | { type: 'typing'; active: boolean }
  | { type: 'say'; context: LineContext; vars?: Record<string, string | number> };

type Listener = (event: CompanionEvent) => void;
const listeners = new Set<Listener>();

export function emitCompanion(event: CompanionEvent): void {
  listeners.forEach((l) => l(event));
}

export function onCompanionEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
