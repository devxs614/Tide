// The pattern engine: plain, deterministic code with no AI inside. It runs
// the four rules over Maya's records for the last 7 or 28 days, drops
// anything she marked "not true for me", and returns at most six patterns,
// most certain first. The AI only puts these results into words afterwards.
import type { PatternInput, PatternResult } from './types';
import { hardTransition } from './rules/hardTransition';
import { stateTaskStart } from './rules/stateTaskStart';
import { strategyBeforeTask } from './rules/strategyBeforeTask';
import { strategyEffect } from './rules/strategyEffect';

export const MAX_PATTERNS = 6;

export function computePatterns(input: PatternInput): PatternResult[] {
  // Safety check-ins never teach the engine anything, whoever built the input.
  const safeInput = { ...input, checkins: input.checkins.filter((c) => !c.safetyTriggered) };
  const all = [
    ...strategyBeforeTask(safeInput),
    ...hardTransition(safeInput),
    ...stateTaskStart(safeInput),
    ...strategyEffect(safeInput),
  ].filter((p) => !input.dismissedKeys.has(p.key));

  // Most certain first, then the biggest difference from usual, then the
  // most observations. Patterns without a baseline count as no difference.
  const gap = (p: PatternResult) => (p.baselineRate === undefined ? 0 : Math.abs(p.rate - p.baselineRate));
  return all
    .sort((a, b) => b.confidence - a.confidence || gap(b) - gap(a) || b.n - a.n)
    .slice(0, MAX_PATTERNS);
}
