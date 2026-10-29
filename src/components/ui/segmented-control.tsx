'use client';

// A pill track with a sliding "thumb" behind the chosen option (v2 spec
// 4.4). The thumb slides with a CSS spring instead of framer-motion's
// layoutId, so it costs nothing on first load (D62). Each option is a radio
// button, so arrow keys and screen readers work as expected.
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  // Shown but not choosable (say, Natural voices when none are set up).
  disabled?: boolean;
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
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const move = (delta: number) => {
    for (let step = 1; step <= options.length; step++) {
      const option = options[(index + delta * step + options.length * step) % options.length];
      if (!option.disabled) return onChange(option.value);
    }
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('relative grid rounded-full border-2 border-line bg-surface-2 p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
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
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-full bg-surface shadow-[0_2px_0_var(--line)] transition-transform duration-(--dur-spring-snappy) ease-(--spring-snappy)"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
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
              'relative z-10 min-h-11 rounded-full px-3 font-display text-[0.8824rem] font-bold',
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
