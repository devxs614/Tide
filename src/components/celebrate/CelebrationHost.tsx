'use client';

// Where celebrations appear, mounted once for the whole app (v2 spec 10.4).
// Small ones play their effect and clear themselves; big ones open the
// overlay, whose code (and the particles) loads only when a big moment
// actually happens. Every celebration is also read to screen readers.
import { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { clearCelebration, useCelebrationView } from '@/lib/celebrate/store';
import { BurstEffect } from './BurstEffect';

const CelebrationOverlay = dynamic(() => import('./CelebrationOverlay').then((m) => m.CelebrationOverlay), { ssr: false });

const EFFECT_MS = 1400;

export function CelebrationHost() {
  const view = useCelebrationView();
  const id = view?.id ?? 0;
  const close = useCallback(() => clearCelebration(id), [id]);

  useEffect(() => {
    if (!view || view.decision.overlay) return;
    const t = window.setTimeout(() => clearCelebration(view.id), EFFECT_MS);
    return () => window.clearTimeout(t);
  }, [view]);

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {view?.announce ?? ''}
      </p>
      {view && !view.decision.overlay && view.decision.effect !== 'none' && <BurstEffect key={view.id} view={view} />}
      {view?.decision.overlay && <CelebrationOverlay key={view.id} view={view} onClose={close} />}
    </>
  );
}
