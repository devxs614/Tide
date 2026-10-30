// "Days with box breathing tended to end okay" (v2 spec 20): for each
// strategy, closed days when Maya used it against closed days when she
// didn't, by how she said the day was overall. Only when both groups have
// enough days and the difference is clear (30 points or more). It's a
// correlation in her own records, and the words say so; never "because".
import { copy } from '@/copy/en';
import { strategyName } from '@/data/strategies';
import { formatShortDay } from '@/lib/time';
import { confidenceFor } from '../confidence';
import type { PatternInput, PatternResult } from '../types';

const GOOD = new Set(['okay', 'good']);

export function wrapHelped(input: PatternInput): PatternResult[] {
  const wraps = (input.dayWraps ?? []).filter((w) => w.completedAt && w.completedAt > input.now - input.windowDays * 86_400_000);
  if (wraps.length === 0) return [];
  const min = Math.max(3, input.minEvidence ?? 3);
  const usedOn = new Map<string, Set<string>>();
  for (const use of input.strategyUses) {
    const day = new Date(use.ts);
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    if (!usedOn.has(use.strategyId)) usedOn.set(use.strategyId, new Set());
    usedOn.get(use.strategyId)!.add(date);
  }
  return [...usedOn.entries()].flatMap(([strategyId, days]) => {
    const a = wraps.filter((w) => days.has(w.date));
    const b = wraps.filter((w) => !days.has(w.date));
    const kA = a.filter((w) => GOOD.has(w.overall ?? '')).length;
    const kB = b.filter((w) => GOOD.has(w.overall ?? '')).length;
    if (a.length < min || b.length < min || kA / a.length - kB / b.length < 0.3) return [];
    const name = strategyName(strategyId);
    return [
      {
        key: `wrapHelped:${strategyId}`,
        kind: 'wrap_helped' as const,
        k: kA,
        n: a.length,
        rate: kA / a.length,
        baselineRate: kB / b.length,
        confidence: confidenceFor(a.length),
        evidenceIds: a.map((w) => w.date),
        evidence: a.map((w) => ({
          id: w.date,
          ts: w.completedAt!,
          label: `${formatShortDay(w.completedAt!)} · ${name}`,
          outcome: w.overall ? copy.wrap.overall[w.overall].literal : '',
        })),
        facts: { strategyName: name, kA, nA: a.length, kB, nB: b.length },
      },
    ];
  });
}
