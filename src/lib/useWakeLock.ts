'use client';

// Keeps the screen on during a focus block (v2 spec 17.6), where the
// browser supports it and Maya hasn't turned it off. The lock is released
// when the block pauses or ends, and taken again if she comes back to the
// tab while it's running.
import { useEffect } from 'react';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock;
    if (!active || !wakeLock) return;
    let lock: WakeLockSentinelLike | null = null;
    const take = () => {
      if (document.visibilityState === 'visible') void wakeLock.request('screen').then((l) => (lock = l)).catch(() => {});
    };
    take();
    document.addEventListener('visibilitychange', take);
    return () => {
      document.removeEventListener('visibilitychange', take);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
