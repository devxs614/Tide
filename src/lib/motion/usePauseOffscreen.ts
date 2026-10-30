'use client';

// Pauses an element's looping CSS animations while it's off screen or the
// tab is hidden (v2 spec 5.6): the shore's waves, clouds and stars, and the
// Check in button's slow breath. It sets `data-paused` straight on the
// element instead of through React state, so scrolling never re-renders
// the whole shore. The companion has its own version with the same rules.
import { useCallback, useRef } from 'react';

export function usePauseOffscreen<T extends Element>() {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!el) return;
    let onScreen = true;
    const apply = () => el.toggleAttribute('data-paused', !onScreen || document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', apply);
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        apply();
      });
      io.observe(el);
    }
    cleanup.current = () => {
      document.removeEventListener('visibilitychange', apply);
      io?.disconnect();
    };
  }, []);
}
