'use client';

// "How did it go?" after a focus block. Every answer is useful data, never a
// grade. "Didn't start" gets a kind reply and the offer of a smaller step;
// "Got going" may suggest one of Maya's own rewards.
import { useState } from 'react';
import { byMode, copy, fill } from '@/copy/en';
import { pickOne } from '@/lib/random';
import { useSettings } from '@/lib/settings';
import type { FocusOutcome as Outcome } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { focusCopy } from '@/copy/focusCopy';

interface Props {
  open: boolean;
  rewards: string[];
  onAnswer: (outcome: Outcome) => Promise<void>;
  onSmallerStep: () => void;
  onDone: () => void;
}

const OUTCOMES: Outcome[] = ['got_going', 'a_little', 'didnt_start'];

export function FocusOutcome({ open, rewards, onAnswer, onSmallerStep, onDone }: Props) {
  const { settings } = useSettings();
  const [answer, setAnswer] = useState<Outcome | null>(null);
  // Picked once per answer so the suggestion doesn't change on every redraw.
  const [reward, setReward] = useState<string | null>(null);

  const choose = async (outcome: Outcome) => {
    await onAnswer(outcome);
    setAnswer(outcome);
    if (outcome === 'got_going') setReward(pickOne(rewards) ?? null);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && answer && onDone()}>
      <SheetContent showCloseButton={!!answer} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{focusCopy.howDidItGo}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 p-5" aria-live="polite">
          {!answer &&
            OUTCOMES.map((o) => (
              <Button key={o} variant="secondary" size="block" onClick={() => void choose(o)} data-demo-id={`focus-outcome-${o}`}>
                {focusCopy.outcomes[o]}
              </Button>
            ))}
          {answer === 'didnt_start' && (
            <>
              <p className="text-lead">{byMode(focusCopy.didntStart, settings.communicationMode)}</p>
              <Button size="block" onClick={onSmallerStep}>
                {focusCopy.smallerStep}
              </Button>
              <Button variant="secondary" size="block" onClick={onDone}>
                {copy.global.notNow}
              </Button>
            </>
          )}
          {answer && answer !== 'didnt_start' && (
            <>
              <p className="text-lead">{focusCopy.saved}</p>
              {reward && <p>{fill(focusCopy.rewardHint, { reward })}</p>}
              <Button size="block" onClick={onDone}>
                {focusCopy.backToTasks}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
