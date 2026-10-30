'use client';

// A background sound (waves, rain or brown noise) while something calm is
// happening: a focus block that's running, or winding down at night. Only
// when Maya turned sound on and chose an ambience; it fades out when the
// moment ends or the screen goes away.
import { useEffect } from 'react';
import { useSettings } from '@/lib/settings';
import { isQuiet } from './useSound';

export function useAmbience(active: boolean): void {
  const { settings } = useSettings();
  const kind = settings['sound.ambience'];
  const sound = active && settings['sound.enabled'] && kind !== 'none' ? kind : null;
  const volume = settings['sound.ambienceVolume'] * settings['sound.volume'];
  useEffect(() => {
    if (!sound || isQuiet()) return;
    let stopped = false;
    void import('./engine').then((engine) => {
      if (!stopped) engine.startAmbience(sound, volume);
    });
    return () => {
      stopped = true;
      void import('./engine').then((engine) => engine.stopAmbience());
    };
  }, [sound, volume]);
}
