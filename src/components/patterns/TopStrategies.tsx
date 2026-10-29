// Every strategy Maya re-checked in this period, with "3 of 4 better" and a
// simple bar. The bar is only decoration; the words carry the numbers.
import { copy, fill } from '@/copy/en';
import type { StrategyTally } from '@/lib/patterns/rules/strategyEffect';

export function TopStrategies({ tallies }: { tallies: StrategyTally[] }) {
  if (tallies.length === 0) return null;
  return (
    <section aria-labelledby="top-strategies" className="flex flex-col gap-3">
      <h2 id="top-strategies" className="text-h3 font-bold">
        {copy.patterns.topStrategies}
      </h2>
      <ul className="flex flex-col gap-3">
        {tallies.map((t) => (
          <li key={t.strategyId} className="flex flex-col gap-1">
            <span className="flex justify-between gap-3">
              <span className="font-bold">{t.name}</span>
              <span className="text-ink-soft">{fill(copy.patterns.topStrategyLine, { k: t.k, n: t.n })}</span>
            </span>
            <span aria-hidden className="h-2 overflow-hidden rounded-full bg-surface-2">
              <span className="block h-full bg-primary/60" style={{ width: `${(t.k / t.n) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
