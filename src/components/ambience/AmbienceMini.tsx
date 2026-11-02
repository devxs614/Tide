'use client';

// The mini player (v2.1 F-09): while a background sound plays and Maya is
// somewhere other than Focus or the Toolkit, a small pill above the tab bar
// says "Rain · playing", with pause or play, stop, and hide (hiding leaves
// the sound on). It loads only once a sound is on.
import { useState } from 'react';
import { Pause, Play, Square, X } from 'lucide-react';
import { fill } from '@/copy/en';
import { ambienceCopy as t } from '@/copy/ambienceCopy';
import { useAmbienceState } from '@/lib/sound/ambienceState';
import { Button } from '@/components/ui/button';

const player = () => import('@/lib/sound/ambiencePlayer');

export function AmbienceMini() {
  const state = useAmbienceState();
  // Hidden for this sound only; a new sound shows the pill again.
  const [hiddenFor, setHiddenFor] = useState<string | null>(null);
  if (!state.sound || hiddenFor === state.sound) return null;
  const name = t.names[state.sound];
  return (
    <section
      aria-label={t.playerLabel}
      className="pointer-events-auto absolute right-3 bottom-full mb-2 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-1 rounded-card border-2 border-line bg-surface py-1 pr-1 pl-4 shadow-sm"
    >
      <span className="min-w-0 font-bold break-words">{fill(state.paused ? t.miniPaused : t.miniPlayer, { sound: name })}</span>
      {state.paused ? (
        <Button variant="quiet" size="sm" onClick={() => void player().then((p) => p.resumeAmbience())}>
          <Play aria-hidden />
          {t.play}
        </Button>
      ) : (
        <Button variant="quiet" size="sm" onClick={() => void player().then((p) => p.pauseAmbience())}>
          <Pause aria-hidden />
          {t.pause}
        </Button>
      )}
      <Button variant="quiet" size="sm" onClick={() => void player().then((p) => p.stopAmbience())} data-demo-id="ambience-mini-stop">
        <Square aria-hidden />
        {t.stop}
      </Button>
      <Button variant="quiet" size="sm" onClick={() => setHiddenFor(state.sound)}>
        <X aria-hidden />
        {t.hide}
      </Button>
    </section>
  );
}
