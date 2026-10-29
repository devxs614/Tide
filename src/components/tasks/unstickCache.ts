// The last Unstick suggestion for each task, kept in memory for this visit.
// When Maya taps "Do it first", does the walk, and comes back, she sees the
// same first step she was given instead of a new one appearing.
import type { UnstickOutputT } from '@/lib/ai/schemas';
import type { StuckReason } from '@/lib/types';

export interface UnstickSuggestion {
  reason: StuckReason;
  output: UnstickOutputT;
  helpful: Array<{ id: string; name: string; better: number; n: number }>;
}

const cache = new Map<string, UnstickSuggestion>();

export function rememberSuggestion(taskId: string, suggestion: UnstickSuggestion): void {
  cache.set(taskId, suggestion);
}

export function recallSuggestion(taskId: string): UnstickSuggestion | undefined {
  return cache.get(taskId);
}
