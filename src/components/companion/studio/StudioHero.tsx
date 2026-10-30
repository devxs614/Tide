'use client';

// The Studio's stage (v2 spec 8.8): a small shore in the theme's colors with
// the companion at its biggest size. Tapping it cycles through its reactions
// (wave, hop, wiggle, its signature move) with its chirp, so Maya can get a
// feel for it before deciding. When she picks another species, the old one
// slides out waving and the new one hops in; at motion Off it simply swaps.
import { useEffect, useRef, useState } from 'react';
import { COMPANION_COPY } from '@/copy/companions';
import { SIZES, type CompanionSpecies, type Expression, type Reaction } from '@/lib/companion/registry';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useSound } from '@/lib/sound/useSound';
import { Companion } from '../Companion';
import { CompanionSay } from '../CompanionSay';
import { NoneCompanion } from '../NoneCompanion';

const TAP_CYCLE: Array<{ reaction: Reaction; expression: Expression }> = [
  { reaction: 'wave', expression: 'waving' },
  { reaction: 'hop', expression: 'happy' },
  { reaction: 'wiggle', expression: 'happy' },
  { reaction: 'special', expression: 'curious' },
];
const SETTLE_MS = 2500;

export function StudioHero({ line, onLineDone }: { line: { text: string; key: number } | null; onLineDone: () => void }) {
  const profile = useCompanion();
  const level = useMotionLevel();
  const play = useSound();
  const [tap, setTap] = useState<{ index: number; key: number } | null>(null);
  const settle = useRef(0);

  // Remember who was here a moment ago, so they can wave goodbye.
  const [current, setCurrent] = useState<CompanionSpecies | null>(profile.species);
  const [leaving, setLeaving] = useState<CompanionSpecies | null>(null);
  if (current !== profile.species) {
    setLeaving(level === 'off' ? null : current);
    setCurrent(profile.species);
    setTap(null);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), 450);
    return () => window.clearTimeout(t);
  }, [leaving]);
  useEffect(() => () => window.clearTimeout(settle.current), []);

  const onTap = () => {
    if (!profile.species) return;
    const index = tap ? (tap.index + 1) % TAP_CYCLE.length : 0;
    setTap({ index, key: (tap?.key ?? 0) + 1 });
    play(`chirp-${profile.species}`);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => setTap(null), SETTLE_MS);
  };
  const now = tap ? TAP_CYCLE[tap.index] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-64 w-full overflow-hidden rounded-card border-2 border-line bg-linear-to-b from-sky-top to-sky-bottom">
        <svg aria-hidden className="absolute inset-x-0 bottom-0 h-28 w-full" viewBox="0 0 400 112" preserveAspectRatio="none">
          <path d="M0 26 Q50 14 100 26 T200 26 T300 26 T400 26 V112 H0 Z" fill="var(--sea)" opacity={0.5} />
          <path d="M0 40 Q60 30 120 40 T240 40 T400 38" fill="none" stroke="var(--foam)" strokeWidth={3} opacity={0.7} />
          <path d="M0 66 Q110 46 210 60 T400 56 V112 H0 Z" fill="var(--sand)" />
        </svg>
        {line && profile.species && (
          <CompanionSay text={line.text} lineKey={line.key} onDone={onLineDone} className="absolute top-3 left-3 z-10" />
        )}
        {leaving && (
          <span aria-hidden className="studio-leave absolute bottom-3 left-1/2 -translate-x-1/2">
            <Companion override={{ species: leaving, accessory: profile.accessory }} size={SIZES.xl} expression="waving" decorative />
          </span>
        )}
        <div key={current ?? 'none'} className="studio-arrive absolute bottom-3 left-1/2 -translate-x-1/2">
          {profile.species ? (
            <button type="button" onClick={onTap} className="block rounded-card">
              <Companion
                size={SIZES.xl}
                expression={now?.expression ?? 'idle'}
                reaction={now?.reaction ?? null}
                reactionKey={tap?.key ?? 0}
              />
            </button>
          ) : (
            <NoneCompanion size={140} />
          )}
        </div>
      </div>
      <p className="text-small text-ink-soft">{profile.species ? COMPANION_COPY.studio.tapHint : COMPANION_COPY.studio.noneHint}</p>
    </div>
  );
}
