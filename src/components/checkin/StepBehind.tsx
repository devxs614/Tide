'use client';

// Step 3, optional: "What might be behind it?" A few tappable causes, and a
// Skip that is just as easy as Next. Nothing here is required.
import { copy } from '@/copy/en';
import type { Cause } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { StepHeader } from './StepHeader';
import { ToggleChip } from './ToggleChip';

interface Props {
  causes: Cause[];
  onToggle: (cause: Cause) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepBehind({ causes, onToggle, onNext, onSkip }: Props) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-4">
        <StepHeader title={copy.checkin.step3Title} stepNumber={3} />
        <p className="text-ink-soft">{copy.checkin.step3Hint}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={copy.checkin.step3Title}>
          {(Object.entries(copy.checkin.causes) as Array<[Cause, string]>).map(([id, label]) => (
            <ToggleChip key={id} label={label} pressed={causes.includes(id)} onToggle={() => onToggle(id)} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-5 sm:flex-row-reverse">
        <Button className="sm:flex-1" onClick={onNext}>
          {copy.global.next}
        </Button>
        <Button variant="secondary" className="sm:flex-1" onClick={onSkip}>
          {copy.global.skip}
        </Button>
      </div>
    </>
  );
}
