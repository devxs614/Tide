'use client';

// The big celebration (v2 spec 10.3–10.4): the companion, a title, a short
// message and "Continue". It only ever appears for pleasant or neutral
// states. Tap anywhere or press Escape to close; focus goes to Continue and
// comes back to where it was. At motion Off it's a plain, still dialog.
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { copy } from '@/copy/en';
import type { CelebrationView } from '@/lib/celebrate/store';
import { SIZES } from '@/lib/companion/registry';
import { useCompanion } from '@/lib/companion/useCompanion';
import { Companion } from '@/components/companion/Companion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Particles = dynamic(() => import('./Particles').then((m) => m.Particles), { ssr: false });

// "No companion" (or celebrations switched off for it): a still ring of
// sparkles in its place.
function SparkleRing() {
  return (
    <svg aria-hidden viewBox="-60 -60 120 120" className="size-28">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * 42;
        const y = Math.sin(a) * 42;
        return (
          <path
            key={i}
            transform={`translate(${x} ${y})`}
            d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z"
            fill={i % 2 ? 'var(--accent)' : 'var(--primary)'}
          />
        );
      })}
    </svg>
  );
}

export function CelebrationOverlay({ view, onClose }: { view: CelebrationView; onClose: () => void }) {
  const continueRef = useRef<HTMLButtonElement>(null);
  const profile = useCompanion();
  const overlay = view.decision.overlay!;
  const { expression, reaction } = view.decision.companion;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    continueRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      data-celebration="big"
      onClick={onClose}
      className={cn('fixed inset-0 z-[60] flex items-center justify-center bg-bg/85 p-6', !overlay.plain && 'cel-overlay-in')}
    >
      {overlay.particles !== 'none' && <Particles kind={overlay.particles} />}
      <div className="card relative flex w-full max-w-sm flex-col items-center gap-3 p-6 text-center">
        {profile.species && profile.placements.celebrations ? (
          <Companion size={SIZES.lg} expression={expression} reaction={reaction ?? null} reactionKey={1} decorative />
        ) : (
          <SparkleRing />
        )}
        <h2 id="celebration-title" className="text-h2 font-extrabold">
          {view.title}
        </h2>
        {view.message && <p className="text-ink-soft">{view.message}</p>}
        <Button ref={continueRef} size="block" onClick={onClose}>
          {copy.celebrate.continue}
        </Button>
      </div>
    </div>
  );
}
