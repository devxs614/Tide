'use client';

// The big countdown and Start / Pause / Resume buttons shared by the walk
// and steps timers. When time is up it says so kindly and waits; nothing
// moves on until Maya chooses.
import { copy } from '@/copy/en';
import { formatCountdown } from '@/lib/time';
import type { useCountdown } from '@/lib/useCountdown';
import { Button } from '@/components/ui/button';

export function TimerControls({ timer, doneLabel, onDone }: { timer: ReturnType<typeof useCountdown>; doneLabel: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-display font-bold tabular-nums" role="timer" aria-live="off">
        {formatCountdown(timer.remaining)}
      </p>
      <p aria-live="polite" className="text-ink-soft">
        {timer.finished ? copy.tools.timeUp : ''}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        {!timer.started && <Button onClick={timer.start}>{copy.tools.timerStart}</Button>}
        {timer.running && (
          <Button variant="secondary" onClick={timer.pause}>
            {copy.tools.timerPause}
          </Button>
        )}
        {timer.paused && <Button onClick={timer.resume}>{copy.tools.timerResume}</Button>}
        <Button variant={timer.finished ? 'default' : 'quiet'} onClick={onDone}>
          {doneLabel}
        </Button>
      </div>
    </div>
  );
}
