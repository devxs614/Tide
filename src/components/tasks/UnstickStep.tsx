'use client';

// Unstick step 2, "Your first step": one small action in big type, the focus
// length, and, when Maya's own history backs it, a strategy that helped
// before this kind of task. She can start, ask for a different (smaller)
// step, or leave it for now. The suggestion is labeled and can be read aloud.
import { useState } from 'react';
import { copy, fill } from '@/copy/en';
import { getTaskType } from '@/data/taskTypes';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { StepHeader } from '@/components/checkin/StepHeader';
import { LeftOffNote } from './LeftOffNote';
import type { UnstickSuggestion } from './unstickCache';

interface Props {
  task: Task;
  suggestion: UnstickSuggestion;
  loading: boolean;
  onStart: () => void;
  onDifferent: () => void;
  onNotNow: () => void;
  onDoFirst: (strategyId: string) => void;
  // True when Maya is back from the strategy she was offered. Asking her to
  // do it first again would read as if Tide forgot she just did it.
  backFromStrategy?: boolean;
}

export function UnstickStep({ task, suggestion, loading, onStart, onDifferent, onNotNow, onDoFirst, backFromStrategy }: Props) {
  const [skipStrategy, setSkipStrategy] = useState(!!backFromStrategy);
  const { output, helpful } = suggestion;
  const strategy = output.strategyId ? helpful.find((h) => h.id === output.strategyId) : undefined;
  const n = output.focusMinutes;

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-4">
        <p className="pr-24 text-caption text-ink-soft">{task.title}</p>
        <LeftOffNote task={task} />
        <StepHeader title={copy.unstick.firstStepTitle} />
        <section aria-label={copy.global.suggestion} className="flex flex-col gap-2 card p-4">
          <p className="text-caption text-ink-soft">{copy.global.suggestion}</p>
          <p className="text-[1.294rem] leading-snug font-bold" aria-live="polite">
            {loading ? copy.unstick.loading : output.firstStep}
          </p>
          <p>{fill(copy.unstick.tryBlock, { n })}</p>
          <ReadAloudButton text={`${output.firstStep} ${fill(copy.unstick.tryBlock, { n })}`} />
        </section>
        {strategy && !skipStrategy && (
          <section className="flex flex-col gap-3 rounded-card border-2 border-line bg-surface-2 p-4">
            <p>
              {fill(copy.unstick.strategyFirst, {
                taskType: getTaskType(task.type).label.toLowerCase(),
                strategy: strategy.name.toLowerCase(),
                k: strategy.better,
                n: strategy.n,
              })}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => onDoFirst(strategy.id)}>
                {copy.unstick.doItFirst}
              </Button>
              <Button variant="quiet" onClick={() => setSkipStrategy(true)}>
                {copy.global.skip}
              </Button>
            </div>
          </section>
        )}
        <p className="text-ink-soft">{output.why}</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-5">
        <Button size="block" onClick={onStart} disabled={loading} data-demo-id="unstick-start">
          {fill(copy.unstick.start, { n })}
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onDifferent} disabled={loading}>
            {copy.unstick.differentStep}
          </Button>
          <Button variant="quiet" className="flex-1" onClick={onNotNow}>
            {copy.global.notNow}
          </Button>
        </div>
      </div>
    </>
  );
}
