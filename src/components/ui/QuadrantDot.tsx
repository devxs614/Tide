// The little colored mark for a state (Surge, Swell, Ebb, Still). With the
// color-blind palette or a high-contrast theme it becomes a shape instead
// (Surge ▲, Swell ●, Ebb ▼, Still ■, v2 spec 4.6.3), so the state can be
// told apart without color. The state's name is always written next to it.
import type { Quadrant } from '@/lib/types';
import { cn } from '@/lib/utils';

const PATHS: Record<Quadrant, string> = {
  surge: 'M6 1 L11 11 L1 11 Z',
  swell: 'M6 1 A5 5 0 1 1 5.99 1 Z',
  ebb: 'M1 1 L11 1 L6 11 Z',
  still: 'M1.5 1.5 H10.5 V10.5 H1.5 Z',
};

export function QuadrantDot({ quadrant, className }: { quadrant: Quadrant; className?: string }) {
  return (
    <span aria-hidden className={cn('relative inline-flex shrink-0 align-middle', className ?? 'size-3')}>
      <span className="q-dot size-full rounded-full" style={{ background: `var(--q-${quadrant})` }} />
      <svg viewBox="0 0 12 12" className="q-shape hidden size-full">
        <path d={PATHS[quadrant]} fill={`var(--q-${quadrant})`} />
      </svg>
    </span>
  );
}
