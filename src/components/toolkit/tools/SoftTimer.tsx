'use client';

// A quiet "1:42 left" line for tools that have a suggested length but no
// hard stop (doodle, brain dump). It starts on its own and only ever
// informs; when it reaches zero it says so and nothing closes.
import { fill } from '@/copy/en';
import { toolsCopy } from '@/copy/toolsCopy';
import { formatCountdown } from '@/lib/time';
import { useCountdown } from '@/lib/useCountdown';

export function SoftTimer({ seconds }: { seconds: number }) {
  const timer = useCountdown(seconds * 1000, { autoStart: true });
  return (
    <p className="text-caption text-ink-soft">
      {timer.finished ? toolsCopy.timeUp : fill(toolsCopy.softTimer, { time: formatCountdown(timer.remaining) })}
    </p>
  );
}
