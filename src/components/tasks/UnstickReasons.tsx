'use client';

// Unstick step 1, "What's making it hard?": six plain reasons to pick from.
// If Maya parked this task during a switch, where she left off comes first.
import { copy } from '@/copy/en';
import type { StuckReason, Task } from '@/lib/types';
import { StepHeader } from '@/components/checkin/StepHeader';
import { LeftOffNote } from './LeftOffNote';

const REASONS = Object.entries(copy.unstick.reasons) as Array<[StuckReason, string]>;

export function UnstickReasons({ task, loading, onChoose }: { task: Task; loading: boolean; onChoose: (r: StuckReason) => void }) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-5 pb-6">
      <p className="pr-24 text-caption text-ink-soft">{task.title}</p>
      <LeftOffNote task={task} />
      <StepHeader title={copy.unstick.title} />
      {loading ? (
        <div aria-hidden className="flex flex-col gap-3">
          <p className="text-ink-soft">{copy.unstick.loading}</p>
          <div className="h-28 animate-pulse rounded-card bg-surface-2" />
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {REASONS.map(([reason, label]) => (
            <li key={reason}>
              <button
                type="button"
                onClick={() => onChoose(reason)}
                className="flex min-h-14 w-full items-center rounded-card border border-line bg-surface px-4 py-3 text-left hover:bg-surface-2"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
