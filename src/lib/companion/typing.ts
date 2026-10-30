'use client';

// "Maya is typing" for the companion (v2 spec 9): call the returned function
// on every keystroke (or dictated word). The companion hears "typing" once
// when she starts and "stopped" 400ms after the last key, so it looks up and
// listens without flickering on every letter.
import { useCallback, useEffect, useRef } from 'react';
import { emitCompanion } from './bus';

export function useTypingSignal(quietMs = 400): () => void {
  const timer = useRef(0);
  const active = useRef(false);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      if (active.current) emitCompanion({ type: 'typing', active: false });
    },
    [],
  );

  return useCallback(() => {
    if (!active.current) {
      active.current = true;
      emitCompanion({ type: 'typing', active: true });
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      active.current = false;
      emitCompanion({ type: 'typing', active: false });
    }, quietMs);
  }, [quietMs]);
}
