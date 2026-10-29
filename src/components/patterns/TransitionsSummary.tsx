// "Hardest switch: lab → class (3 of 4 hard)", from the switches Maya rated
// in this period. Hidden when she hasn't rated any.
import { copy, fill } from '@/copy/en';
import { KIND_WORDS } from '@/lib/bridge';
import type { TransitionGroup } from '@/lib/patterns/rules/hardTransition';

export function TransitionsSummary({ groups }: { groups: TransitionGroup[] }) {
  const hardest = [...groups].sort((a, b) => b.k / b.n - a.k / a.n || b.n - a.n)[0];
  if (!hardest) return null;
  return (
    <section aria-labelledby="transitions-heading" className="flex flex-col gap-2">
      <h2 id="transitions-heading" className="text-h3 font-bold">
        {copy.patterns.transitions}
      </h2>
      <p>
        {fill(copy.patterns.hardestSwitch, {
          from: KIND_WORDS[hardest.fromLabel] ?? hardest.fromLabel,
          to: KIND_WORDS[hardest.toLabel] ?? hardest.toLabel,
          k: hardest.k,
          n: hardest.n,
        })}
      </p>
    </section>
  );
}
