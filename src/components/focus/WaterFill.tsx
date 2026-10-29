'use client';

// The focus timer's face: a circle that slowly fills with water from the
// bottom, with the time left in the middle. With reduced motion it becomes a
// plain horizontal bar and the numbers, with nothing rising or moving.
import { copy, fill } from '@/copy/en';
import { useReducedMotionPref } from '@/lib/settings';
import { formatCountdown } from '@/lib/time';

export function WaterFill({ progress, remaining }: { progress: number; remaining: number }) {
  const reduce = useReducedMotionPref();
  const time = formatCountdown(remaining);
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  if (reduce) {
    return (
      <div className="flex w-full max-w-[320px] flex-col items-center gap-3">
        <p className="text-display font-bold tabular-nums" aria-hidden>
          {time}
        </p>
        <div
          role="progressbar"
          aria-label={copy.focus.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={fill(copy.focus.timeLeft, { time })}
          className="h-3 w-full overflow-hidden rounded-full bg-surface-2"
        >
          <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-label={copy.focus.progressLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={fill(copy.focus.timeLeft, { time })}
      className="relative flex size-[220px] items-center justify-center overflow-hidden rounded-full border-2 border-line bg-surface"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 bg-water transition-[height] duration-500 ease-out"
        style={{ height: `${percent}%` }}
      />
      <span aria-hidden className="relative text-display font-bold tabular-nums">
        {time}
      </span>
    </div>
  );
}
