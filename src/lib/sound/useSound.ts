'use client';

// How a component asks for a sound: `const play = useSound(); play('tap')`.
// It does nothing unless Maya turned sound on (it's off by default), the
// category is on, and nothing has asked for quiet (the crisis screen, the
// support page, a muted demo). The engine itself loads on first use.
import { useCallback } from 'react';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import type { SoundName } from './names';

let quiet = 0;

// The crisis screen and the support page call this while they're open:
// no playful sound there, ever.
export function holdQuiet(): () => void {
  quiet += 1;
  return () => {
    quiet = Math.max(0, quiet - 1);
  };
}

export function isQuiet(): boolean {
  return quiet > 0;
}

export function soundSettingsFrom(settings: Settings) {
  return {
    volume: settings['sound.volume'],
    categories: {
      ui: settings['sound.ui'],
      celebration: settings['sound.celebrations'],
      companion: settings['sound.companion'],
    },
  };
}

export function useSound(): (name: SoundName) => void {
  const { settings } = useSettings();
  const enabled = settings['sound.enabled'];
  return useCallback(
    (name: SoundName) => {
      if (!enabled || quiet > 0) return;
      void import('./engine').then((engine) => engine.playSound(name, soundSettingsFrom(settings)));
    },
    [enabled, settings],
  );
}
