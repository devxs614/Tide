'use client';

// Touch feedback in one call: a soft sound (if sound is on) and a tiny
// vibration (if haptics are on and the phone supports them). Buttons,
// switches and chips use this so feedback is consistent everywhere.
import { useCallback } from 'react';
import { useSettings } from '@/lib/settings';
import { haptic, type HapticKind } from '@/lib/haptics';
import { useSound } from './useSound';
import type { SoundName } from './names';

export function useFeedback(): (sound: SoundName, vibration?: HapticKind) => void {
  const play = useSound();
  const { settings } = useSettings();
  const vibrate = settings['haptics.enabled'];
  return useCallback(
    (sound: SoundName, vibration: HapticKind = 'light') => {
      play(sound);
      haptic(vibration, vibrate);
    },
    [play, vibrate],
  );
}
