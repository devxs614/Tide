'use client';

// One narrator for the page (demo fix pack, D-2), reading with the person's
// own voice settings as they are when each caption is spoken: rate, chosen
// voice, accent, natural voice and whether a natural voice is allowed.
import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import type { SpeakRequest } from '@/lib/voice/engine';
import { note } from './engine';
import { Narrator } from './narrator';

function requestFrom(settings: Settings): SpeakRequest {
  return {
    text: '',
    engine: settings['voice.engine'],
    rate: settings['voice.rate'],
    deviceVoiceURI: settings['voice.deviceVoiceURI'],
    accent: settings['voice.accent'],
    naturalVoice: settings['voice.naturalVoice'],
    naturalAllowed: settings['privacy.naturalVoiceAllowed'],
  };
}

export function useNarrator(): Narrator {
  const { settings } = useSettings();
  const [narrator] = useState(() => new Narrator({ log: note }));
  useEffect(() => narrator.settingsChanged(requestFrom(settings)), [narrator, settings]);
  return narrator;
}
