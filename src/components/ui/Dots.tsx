// Small dot meters: energy cost on task cards (●●○) and confidence on
// pattern cards (●●●○). The dots are decoration; the words carry the meaning,
// visibly for confidence and for screen readers on both.
import { copy, fill } from '@/copy/en';
import { cn } from '@/lib/utils';

function DotRow({ filled, total }: { filled: number; total: number }) {
  return (
    <span aria-hidden className="inline-flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn('size-2 rounded-full border border-ink-soft', i < filled ? 'bg-ink-soft' : 'bg-transparent')}
        />
      ))}
    </span>
  );
}

export function EnergyDots({ cost }: { cost: number }) {
  return (
    <span className="inline-flex items-center">
      <DotRow filled={cost} total={3} />
      <span className="sr-only">{fill(copy.tasks.energyLabel, { n: cost })}</span>
    </span>
  );
}

export function ConfidenceDots({ confidence }: { confidence: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-caption text-ink-soft">
      <DotRow filled={confidence} total={4} />
      {fill(copy.patterns.confidence, { c: confidence })}
    </span>
  );
}
