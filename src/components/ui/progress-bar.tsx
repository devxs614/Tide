// A chunky progress bar (v2 spec 4.4): a 16px pill with a lighter stripe
// along the top of the fill. It always has a label for screen readers and
// the real progressbar role, so "Step 3 of 12" is heard, not just seen.
import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max = 1,
  label,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div
        className="relative h-full rounded-full bg-primary transition-[width] duration-(--dur-spring-gentle) ease-(--spring-gentle)"
        style={{ width: `${pct}%` }}
      >
        <span aria-hidden className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/35" />
      </div>
    </div>
  );
}
