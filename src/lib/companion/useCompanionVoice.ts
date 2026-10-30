'use client';

// Which natural voice reads the companion's lines. Maya's own pick wins;
// otherwise each species has a voice matched to its personality (Capi's is
// slow and low, Zip's is bright). Undefined means "no natural voices here",
// and the read-aloud engine falls back to the device voice as usual.
import { useEffect, useState } from 'react';
import { COMPANION_CLOUD_VOICE, type TtsProvider } from '@/data/voices';
import { ttsStatus } from '@/lib/voice/cloudEngine';
import { useCompanion } from './useCompanion';

export function useCompanionVoice(): string | undefined {
  const profile = useCompanion();
  const [provider, setProvider] = useState<TtsProvider | null>(null);
  useEffect(() => {
    let live = true;
    void ttsStatus().then((s) => {
      if (live && s.available && s.provider !== 'none') setProvider(s.provider);
    });
    return () => {
      live = false;
    };
  }, []);
  if (profile.voice) return profile.voice;
  return provider && profile.species ? COMPANION_CLOUD_VOICE[provider][profile.species] : undefined;
}
