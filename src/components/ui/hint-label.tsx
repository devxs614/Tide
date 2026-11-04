// A small tooltip drawn with CSS only (v2.3 Item 1): the word above an
// icon-only control, shown while it's hovered or has keyboard focus. The
// check-in button and the tab bar sit on every screen, and Radix's tooltip
// would have pushed Today's first load past its 300 KB budget. The control
// itself carries the name for screen readers, so this is aria-hidden.
import { cn } from '@/lib/utils';

export function HintLabel({ label, show, className }: { label: string; show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute bottom-full left-1/2 z-(--z-bubble) mb-1 -translate-x-1/2 rounded-input bg-ink px-2 py-1 text-caption font-bold whitespace-nowrap text-surface opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
        className,
      )}
    >
      {label}
    </span>
  );
}
