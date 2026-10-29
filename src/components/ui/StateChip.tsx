'use client';

// How Maya checked in, at a glance: "Ebb · Drained, Frustrated · 3:40 pm".
// The color dot never stands alone; the state name is always written out,
// and screen readers hear a full sentence instead of the dots and middots.
import { copy, fill, quadrantLabel } from '@/copy/en';
import { emotionWord } from '@/data/emotions';
import { QUADRANT_STYLES } from '@/lib/quadrantStyles';
import { useSettings } from '@/lib/settings';
import { formatTime } from '@/lib/time';
import type { CheckIn } from '@/lib/types';
import { cn } from '@/lib/utils';

export function StateChip({ checkIn, showTime = true, className }: { checkIn: CheckIn; showTime?: boolean; className?: string }) {
  const { settings } = useSettings();
  const style = QUADRANT_STYLES[checkIn.quadrant];
  const name = quadrantLabel(checkIn.quadrant, settings.communicationMode);
  const words = checkIn.emotions.map(emotionWord);
  const time = formatTime(checkIn.ts);
  const label = words.length
    ? fill(copy.stateChip.label, { quadrant: name, feelings: words.join(', ').toLowerCase(), time })
    : fill(copy.stateChip.labelNoFeelings, { quadrant: name, time });

  return (
    <p className={cn('inline-flex min-h-8 max-w-full flex-wrap items-center gap-x-2 rounded-2xl px-3 py-1', style.tint, className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className={cn('size-2.5 shrink-0 rounded-full', style.dot)} />
      <span aria-hidden className="font-bold text-ink">
        {name}
        {words.length > 0 && ` · ${words.join(', ')}`}
      </span>
      {showTime && (
        <span aria-hidden className="text-ink-soft">
          · {time}
        </span>
      )}
    </p>
  );
}
