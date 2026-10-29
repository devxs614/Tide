'use client';

// The operating system's "reduce motion" setting, read straight from the
// browser and kept up to date if Maya changes it while Tide is open. This is
// a few lines instead of framer-motion's hook, so every page doesn't have to
// download an animation library just to ask the question.
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
