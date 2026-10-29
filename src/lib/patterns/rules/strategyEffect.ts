// Rule D, strategy effect: "you felt better after box breathing 4 of 5
// times", from the re-check answers. Every strategy with at least one answer
// appears in "Top strategies" as plain k of n; only those with 3 or more
// answers and at least 60% "better" become a pattern card.
import { copy } from '@/copy/en';
import { strategyName } from '@/data/strategies';
import { formatShortDay, formatTime } from '@/lib/time';
import type { StrategyUse } from '@/lib/types';
import { confidenceFor, inWindow } from '../confidence';
import type { PatternInput, PatternResult } from '../types';

export interface StrategyTally {
  strategyId: string;
  name: string;
  k: number; // "better"
  n: number; // re-checked at all
  uses: StrategyUse[];
}

export function strategyTallies(input: Pick<PatternInput, 'now' | 'windowDays' | 'strategyUses'>): StrategyTally[] {
  const byStrategy = new Map<string, StrategyUse[]>();
  for (const u of input.strategyUses) {
    if (!u.result || !inWindow(u.ts, input.now, input.windowDays)) continue;
    byStrategy.set(u.strategyId, [...(byStrategy.get(u.strategyId) ?? []), u]);
  }
  return [...byStrategy.entries()]
    .map(([strategyId, uses]) => ({
      strategyId,
      name: strategyName(strategyId),
      k: uses.filter((u) => u.result === 'better').length,
      n: uses.length,
      uses,
    }))
    .sort((a, b) => b.k / b.n - a.k / a.n || b.n - a.n);
}

export function strategyEffect(input: PatternInput): PatternResult[] {
  return strategyTallies(input).flatMap((t) => {
    const rate = t.k / t.n;
    if (t.n < 3 || rate < 0.6) return [];
    return [
      {
        key: `strategyEffect:${t.strategyId}`,
        kind: 'strategy_effect' as const,
        k: t.k,
        n: t.n,
        rate,
        confidence: confidenceFor(t.n),
        evidenceIds: t.uses.map((u) => u.id),
        evidence: t.uses
          .sort((a, b) => a.ts - b.ts)
          .map((u) => ({
            id: u.id,
            ts: u.ts,
            label: `${formatShortDay(u.ts)}, ${formatTime(u.ts)} · ${t.name}`,
            outcome: copy.toolkit.recheckOptions[u.result!],
          })),
        facts: { strategyName: t.name, k: t.k, n: t.n },
      },
    ];
  });
}
