'use client';

// v2's background sound while something calm is happening: a focus block
// that's running, or winding down at night. Only when Maya turned sound on
// and chose a sound in Settings → Sound. Since v2.1 (F-09) it goes through
// the ambience player, and it steps aside when she picked a sound in the
// player herself: that one is hers to stop.
import { useEffect } from 'react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { getAmbienceState } from './ambienceState';
import { isQuiet } from './useSound';

export function useAmbience(active: boolean): void {
  const { settings } = useSettings();
  const kind = settings['sound.ambience'];
  const sound = active && settings['sound.enabled'] && kind !== 'none' ? kind : null;
  const volume = settings['sound.ambienceVolume'] * settings['sound.volume'];
  useEffect(() => {
    if (!sound || isQuiet() || getAmbienceState().sound) return;
    let started = false;
    void import('./ambiencePlayer').then((player) => {
      if (getAmbienceState().sound) return;
      // v2 played at volume × 0.5 into a 0.6 master (0.3 in all); the
      // player halves what it's given, so 0.6 × volume sounds the same.
      player.playAmbience(sound, { volume: Math.min(1, volume * 0.6), title: copy.sound.ambiences[sound], auto: true });
      started = true;
    });
    return () => {
      void import('./ambiencePlayer').then((player) => {
        if (started && getAmbienceState().auto) player.stopAmbience();
      });
    };
  }, [sound, volume]);
}
