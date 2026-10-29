'use client';

// The generic runner for strategies without a special tool ("Desk stretch",
// "Count back by 7"): the steps are listed above by the runner, and this
// gives them a countdown and an "I'm done".
import { copy } from '@/copy/en';
import { useCountdown } from '@/lib/useCountdown';
import { TimerControls } from './TimerControls';
import type { ToolProps } from './types';

export function StepsTimer({ strategy, onDone }: ToolProps) {
  const timer = useCountdown(strategy.durationSec * 1000);
  return <TimerControls timer={timer} doneLabel={copy.toolkit.imDone} onDone={onDone} />;
}
