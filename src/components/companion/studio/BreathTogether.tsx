'use client';

// "Try a breath together" in the Studio (v2 spec 8.8): one round of box
// breathing, four counts per side, with the companion leading: it grows on
// the in-breath, holds, and settles on the out-breath. It's a taste of the
// Toolkit's breathing, so it runs once and then says so, kindly.
import { useEffect, useState } from 'react';
import { Wind } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { COMPANION_COPY } from '@/copy/companions';
import { useSettings } from '@/lib/settings';
import { useSound } from '@/lib/sound/useSound';
import { useVoice } from '@/lib/voice/useVoice';
import { Button } from '@/components/ui/button';
import { Companion } from '../Companion';
import type { BreathPhase } from '../CompanionFigure';

const PHASES: BreathPhase[] = ['in', 'hold-in', 'out', 'hold-out'];
const WORDS = [copy.tools.breathe.in, copy.tools.breathe.holdIn, copy.tools.breathe.out, copy.tools.breathe.holdOut];
const CUES = [copy.voice.breath.in, copy.voice.breath.hold, copy.voice.breath.out, copy.voice.breath.hold];
const SIDE_S = 4;
const TOTAL_S = SIDE_S * 4;

export function BreathTogether() {
  const { settings } = useSettings();
  const play = useSound();
  const voice = useVoice();
  // Seconds into the round, or null before the first one. Past TOTAL_S the
  // round is over and the button comes back.
  const [second, setSecond] = useState<number | null>(null);
  const running = second !== null && second < TOTAL_S;
  const done = second !== null && second >= TOTAL_S;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSecond((s) => (s ?? 0) + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Each side's cue, once, as it starts (the same cues as the Toolkit).
  const elapsed = second ?? 0;
  const side = running ? Math.floor(elapsed / SIDE_S) : -1;
  useEffect(() => {
    if (side < 0) return;
    if (settings['voice.breathingCues']) void voice.speak(CUES[side]);
    if (side === 0) play('breath-in');
    if (side === 2) play('breath-out');
    // Only when a new side begins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  const start = () => setSecond(0);

  return (
    <section aria-labelledby="studio-breath" className="card flex flex-col items-center gap-3 p-4">
      <h2 id="studio-breath" className="self-start text-h3 font-extrabold">
        {COMPANION_COPY.studio.tryBreath}
      </h2>
      <p className="self-start text-small text-ink-soft">{COMPANION_COPY.studio.breathHint}</p>
      <Companion
        size={128}
        expression={running ? 'breathing' : done ? 'happy' : 'calm'}
        breathPhase={running ? PHASES[side] : null}
        breathPhaseMs={SIDE_S * 1000}
        decorative
      />
      <p aria-live="polite" className="min-h-7 font-display text-h3 font-bold">
        {running
          ? fill(COMPANION_COPY.studio.breathCount, { phase: WORDS[side], count: SIDE_S - (elapsed % SIDE_S) })
          : done
            ? COMPANION_COPY.studio.breathDone
            : ''}
      </p>
      {!running && (
        <Button variant="secondary" onClick={start}>
          <Wind aria-hidden />
          {COMPANION_COPY.studio.tryBreath}
        </Button>
      )}
    </section>
  );
}
