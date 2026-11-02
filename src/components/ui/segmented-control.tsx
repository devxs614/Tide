'use client';

// A pill track with a sliding "thumb" behind the chosen option (v2 spec
// 4.4). The thumb slides with a CSS spring instead of framer-motion's
// layoutId, so it costs nothing on first load (D62). Each option is a radio
// button, so arrow keys and screen readers work as expected.
// At big text sizes the options can stop fitting side by side; rather than
// squeeze or cut a label, it becomes a vertical list with the same radio
// buttons (v2.1 F-02).
import { useEffect, useRef, useState } from 'react';
import { useSettings } from '@/lib/settings';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  // Shown but not choosable (say, Natural voices when none are set up).
  disabled?: boolean;
}

// Side by side until a label doesn't fit its segment; then stacked, until the
// track is wider than when it had to stack (or the text size changes).
function useStacking(textScale: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [stackedAt, setStackedAt] = useState<number | null>(null);
  const [seenScale, setSeenScale] = useState(textScale);
  if (seenScale !== textScale) {
    setSeenScale(textScale);
    setStackedAt(null);
  }
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (stackedAt !== null) {
        if (width > stackedAt + 1) setStackedAt(null);
        return;
      }
      const buttons = Array.from(el.querySelectorAll<HTMLElement>('[role="radio"]'));
      if (buttons.some((b) => b.scrollWidth > b.clientWidth + 1)) setStackedAt(width);
    });
    ro.observe(el);
    el.querySelectorAll('[role="radio"]').forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [stackedAt]);
  return { ref, stacked: stackedAt !== null };
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const { settings } = useSettings();
  const { ref, stacked } = useStacking(settings.textScale);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const move = (delta: number) => {
    for (let step = 1; step <= options.length; step++) {
      const option = options[(index + delta * step + options.length * step) % options.length];
      if (!option.disabled) return onChange(option.value);
    }
  };
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      data-stacked={stacked || undefined}
      className={cn('relative grid border-2 border-line bg-surface-2 p-1', stacked ? 'gap-1 rounded-card' : 'rounded-full', className)}
      style={{ gridTemplateColumns: stacked ? '1fr' : `repeat(${options.length}, minmax(0, 1fr))` }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          move(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {!stacked && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 left-1 rounded-full bg-surface shadow-[0_2px_0_var(--line)] transition-transform duration-(--dur-spring-snappy) ease-(--spring-snappy)"
          style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
        />
      )}
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-disabled={option.disabled || undefined}
            tabIndex={checked ? 0 : -1}
            onClick={() => !option.disabled && onChange(option.value)}
            className={cn(
              // No z-index: positioned and after the thumb, the labels already
              // sit on top of it. A z-10 here used to paint over sticky panels
              // (Settings' Live Preview) as they scrolled past.
              'relative min-h-11 rounded-full px-3 font-display text-[0.8824rem] font-bold',
              stacked ? 'text-left' : 'whitespace-nowrap',
              stacked && checked && 'bg-surface shadow-[0_2px_0_var(--line)]',
              checked ? 'text-ink' : 'text-ink-soft hover:text-ink',
              option.disabled && 'cursor-not-allowed line-through decoration-2 opacity-60 hover:text-ink-soft',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
