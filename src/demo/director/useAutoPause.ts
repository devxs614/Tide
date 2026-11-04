'use client';

// Two ways a tour gets paused without the bar (demo fix pack, D-5). A
// presenter who switches windows comes back to a paused tour, not one that
// ran on without them, and coming back never resumes it: only a person
// pressing play does. And a keyboard's or headset's play/pause keys work
// like the button, through the same guard against one press counting twice.
import { useEffect } from 'react';
import { director } from './engine';

export function useAutoPause(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.hidden) director.pause('hidden');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [active]);

  useEffect(() => {
    const session = typeof navigator === 'undefined' ? undefined : navigator.mediaSession;
    if (!session || !active) return;
    const actions: MediaSessionAction[] = ['play', 'pause'];
    const handle = (handler: (() => void) | null) => {
      for (const action of actions) {
        try {
          session.setActionHandler(action, handler);
        } catch {
          // Not every browser knows every action.
        }
      }
    };
    handle(() => director.toggle('media'));
    return () => handle(null);
  }, [active]);
}
