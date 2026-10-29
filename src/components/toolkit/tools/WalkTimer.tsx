'use client';

// The 3-minute walk: a big countdown Maya can glance at, and a gentle
// vibration at the end if she turned that on, so the phone can stay in her
// pocket. "I'm back" works at any time.
import { useEffect, useRef } from 'react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { useCountdown } from '@/lib/useCountdown';
import { TimerControls } from './TimerControls';
import type { ToolProps } from './types';

export function WalkTimer({ strategy, onDone }: ToolProps) {
  const { settings } = useSettings();
  const timer = useCountdown(strategy.durationSec * 1000);
  const buzzed = useRef(false);

  useEffect(() => {
    if (!timer.finished || buzzed.current) return;
    buzzed.current = true;
    if (settings.vibration && typeof navigator !== 'undefined') navigator.vibrate?.([200, 100, 200]);
  }, [timer.finished, settings.vibration]);

  return <TimerControls timer={timer} doneLabel={copy.tools.walk.imBack} onDone={onDone} />;
}
