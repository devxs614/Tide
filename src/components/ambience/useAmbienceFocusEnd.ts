'use client';

// "Until focus ends" (v2.1 F-09): the background sound fades to silence just
// before the block ends, on the audio clock, so the end alert is heard
// clearly; a pause holds it, and the end stops it for good. A sound playing
// "until I stop" or for a set time carries on.
import { useEffect } from 'react';
import { now } from '@/lib/clock';
import { secondsUntil } from '@/lib/focus/alertPlan';
import { useAmbienceState } from '@/lib/sound/ambienceState';
import type { TimerPhase } from '@/components/focus/useFocusTimer';

export function useAmbienceFocusEnd(phase: TimerPhase, endsAt: number | null): void {
  const { sound, untilFocusEnds } = useAmbienceState();
  const tied = !!sound && untilFocusEnds;
  useEffect(() => {
    if (!tied) return;
    void import('@/lib/sound/ambiencePlayer').then((p) => {
      if (phase === 'running' && endsAt) p.scheduleAmbienceEnd(secondsUntil(endsAt, now()));
      else if (phase === 'paused') p.cancelAmbienceEnd();
      else if (phase === 'finished') p.stopAmbience(0.3);
    });
  }, [tied, phase, endsAt]);
}
