'use client';

// Box breathing: a dot travels around a square, 4 seconds per side, while
// the middle says "Breathe in · 4", "Hold · 4", "Breathe out · 4", "Hold · 4".
// Two minutes by default, Stop at any time. With reduced motion the dot
// stays still and only the words and count change. Screen readers hear each
// new phase, not every second, which would be exhausting. With "Speak
// breathing cues" on (v2), a voice says each phase as it begins.
import { useEffect, useRef, useState } from 'react';
import { copy, fill } from '@/copy/en';
import { now } from '@/lib/clock';
import { useReducedMotionPref, useSettings } from '@/lib/settings';
import { useSound } from '@/lib/sound/useSound';
import { useVoice } from '@/lib/voice/useVoice';
import { Button } from '@/components/ui/button';
import type { ToolProps } from './types';

const SIDE_MS = 4000;
const TOTAL_MS = 120_000;
const PHASES = [copy.tools.breathe.in, copy.tools.breathe.holdIn, copy.tools.breathe.out, copy.tools.breathe.holdOut];
const CUES = [copy.voice.breath.in, copy.voice.breath.hold, copy.voice.breath.out, copy.voice.breath.hold];
// Device voices take a moment to start; speaking a little early keeps the
// word on the beat (v2 spec 7.9).
const CUE_LEAD_MS = 150;

// Where the dot is on the square's edge, as percentages: up the left side
// while breathing in, across the top while holding, and so on.
function dotPosition(phase: number, t: number): { left: number; top: number } {
  if (phase === 0) return { left: 0, top: 100 - t * 100 };
  if (phase === 1) return { left: t * 100, top: 0 };
  if (phase === 2) return { left: 100, top: t * 100 };
  return { left: 100 - t * 100, top: 100 };
}

export function BoxBreathing({ onDone }: ToolProps) {
  const reduce = useReducedMotionPref();
  const { settings } = useSettings();
  const voice = useVoice();
  const play = useSound();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [, redraw] = useState(0);
  const cuedPhase = useRef(-1);

  const elapsed = startedAt === null ? 0 : now() - startedAt;
  const finished = elapsed >= TOTAL_MS;

  useEffect(() => {
    if (startedAt === null || finished) return;
    const id = setInterval(() => redraw((n) => n + 1), reduce ? 250 : 50);
    return () => clearInterval(id);
  }, [startedAt, reduce, finished]);
  // Speak each phase's cue (and its soft breath sound) once, just before it starts.
  useEffect(() => {
    if (!settings['voice.breathingCues'] || startedAt === null || finished) return;
    const upcoming = Math.floor((elapsed + CUE_LEAD_MS) / SIDE_MS);
    if (upcoming === cuedPhase.current || upcoming * SIDE_MS >= TOTAL_MS) return;
    cuedPhase.current = upcoming;
    void voice.speak(CUES[upcoming % 4]);
    if (upcoming % 4 === 0) play('breath-in');
    if (upcoming % 4 === 2) play('breath-out');
  });
  const inSide = elapsed % SIDE_MS;
  const phase = Math.floor(elapsed / SIDE_MS) % 4;
  const count = 4 - Math.floor(inSide / 1000);
  const dot = dotPosition(phase, inSide / SIDE_MS);
  const label = startedAt === null ? copy.tools.breathe.ready : finished ? copy.tools.breathe.finished : fill(copy.tools.breathe.phase, { phase: PHASES[phase], count });

  return (
    <div className="flex flex-col items-center gap-5">
      <div role="img" aria-label={copy.tools.breathe.label} className="relative size-[200px] rounded-md border-4 border-primary/40">
        {!reduce && startedAt !== null && !finished && (
          <span
            aria-hidden
            className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
            style={{ left: `${dot.left}%`, top: `${dot.top}%` }}
          />
        )}
        <p aria-hidden className="absolute inset-0 flex items-center justify-center p-4 text-center text-lead font-bold">
          {label}
        </p>
      </div>
      <p aria-live="polite" className="sr-only">
        {startedAt === null ? '' : finished ? copy.tools.breathe.finished : PHASES[phase]}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        {startedAt === null && <Button onClick={() => setStartedAt(now())}>{copy.tools.timerStart}</Button>}
        {startedAt !== null && !finished && (
          <Button variant="secondary" onClick={onDone}>
            {copy.tools.stop}
          </Button>
        )}
        {finished && <Button onClick={onDone}>{copy.toolkit.continue}</Button>}
      </div>
    </div>
  );
}
