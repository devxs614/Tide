// Loading placeholders (v2 spec 17.9). IndexedDB usually answers in a few
// milliseconds, so most people never see these; on a slow phone, quiet
// shapes where the content will be stop the page from jumping when it
// arrives, and stop an empty state ("Your shore is quiet") from flashing
// before the real data loads. They're hidden from screen readers, which
// get the content itself a moment later, and pulse only when motion is on.
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-card bg-surface-2', className)} />;
}

// A title, then a few cards: the shape of most Tide screens.
export function ScreenSkeleton({ rows = 3, rowClassName = 'h-24', className }: { rows?: number; rowClassName?: string; className?: string }) {
  return (
    <div aria-hidden className={cn('flex flex-col gap-4', className)}>
      <Skeleton className="h-9 w-1/2 rounded-input" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
  );
}
