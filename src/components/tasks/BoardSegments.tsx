'use client';

// The status pills above the board ("Not started (3)", "In progress (1)"…),
// the board's main way around (v2.3 spec 5.2). In the swipe view a pill
// scrolls its column into place and follows along as Maya swipes; arrow
// keys move between pills. Under them, four dots show which column is in
// view: decorative, since the pills already say it.
import type { KeyboardEvent } from 'react';
import { copy, fill } from '@/copy/en';
import type { TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { STATUS_ORDER } from './MoveToMenu';

interface Props {
  active: TaskStatus;
  counts: Record<TaskStatus, number>;
  onPick: (status: TaskStatus) => void;
  showDots: boolean;
}

export function BoardSegments({ active, counts, onPick, showDots }: Props) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = STATUS_ORDER.indexOf(active) + (e.key === 'ArrowRight' ? 1 : -1);
    const next = STATUS_ORDER[(i + STATUS_ORDER.length) % STATUS_ORDER.length];
    onPick(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-segment="${next}"]`)?.focus();
  };
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={copy.tasks.segmentLabel} className="flex flex-wrap gap-2" onKeyDown={onKeyDown}>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            data-segment={s}
            aria-pressed={active === s}
            onClick={() => onPick(s)}
            className={cn(
              'min-h-12 rounded-full border px-3 text-caption',
              active === s ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface text-ink',
            )}
          >
            {fill(copy.tasks.countLabel, { status: copy.tasks.statuses[s], count: counts[s] })}
          </button>
        ))}
      </div>
      {showDots && (
        <div aria-hidden className="flex justify-center gap-2">
          {STATUS_ORDER.map((s) => (
            <span key={s} className={cn('size-2 rounded-full', active === s ? 'bg-primary' : 'bg-line')} />
          ))}
        </div>
      )}
    </div>
  );
}
