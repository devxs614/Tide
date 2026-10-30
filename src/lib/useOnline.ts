'use client';

// Whether the browser thinks it's online (v2 spec 17.2). Tide works the same
// offline; only the AI words switch to the built-in ones, and the offline
// pill says so. The server render assumes online, so nothing flashes.
import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
