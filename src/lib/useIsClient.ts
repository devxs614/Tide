'use client';

// True only after the page has hydrated in the browser. Features that depend
// on browser APIs (dictation, read aloud) check this so the server and the
// first browser render agree, and the button appears a moment later instead
// of causing a hydration mismatch.
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
