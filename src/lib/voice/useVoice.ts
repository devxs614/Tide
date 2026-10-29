'use client';

// How a component reads something aloud: `const voice = useVoice();
// voice.speak(text)`. It applies Maya's voice settings, tracks whether *this*
// component's text is the one being read (so only its button shows "Stop
// reading"), and shows a quiet toast if no voice could play at all.
import { useCallback, useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { browserVoicesSupported } from './browserEngine';
import { ttsStatus } from './cloudEngine';
import { attemptsFor, currentSpeaker, onSpeakingChange, speak as engineSpeak, stopSpeaking, type SpeakOutcome, type SpeakRequest } from './engine';

export function useVoice() {
  const { settings } = useSettings();
  const engine = settings['voice.engine'];
  const [speaking, setSpeaking] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const id = useId();

  useEffect(() => {
    if (engine === 'off' || engine === 'device') return;
    let live = true;
    void ttsStatus().then((s) => live && setCloudReady(s.available));
    return () => {
      live = false;
    };
  }, [engine]);

  useEffect(() => onSpeakingChange((on, owner) => setSpeaking(on && owner === id)), [id]);

  // If the component goes away while it's talking, stop.
  useEffect(
    () => () => {
      if (currentSpeaker() === id) stopSpeaking();
    },
    [id],
  );

  const speak = useCallback(
    async (
      text: string | string[],
      // Overrides, for "Play sample" on one particular voice in Settings.
      opts: { naturalVoice?: string; deviceVoiceURI?: string; engine?: 'natural' | 'device' } = {},
    ): Promise<SpeakOutcome> => {
      const req: SpeakRequest = {
        text,
        engine: opts.engine ?? engine,
        rate: settings['voice.rate'],
        deviceVoiceURI: opts.deviceVoiceURI ?? settings['voice.deviceVoiceURI'],
        accent: settings['voice.accent'],
        naturalVoice: opts.naturalVoice ?? settings['voice.naturalVoice'],
        naturalAllowed: settings['privacy.naturalVoiceAllowed'],
      };
      const outcome = await engineSpeak(req, attemptsFor(req), id);
      if (outcome === 'failed') toast(copy.voice.couldntPlay);
      return outcome;
    },
    [engine, settings, id],
  );

  const stop = useCallback(() => {
    if (currentSpeaker() === id) stopSpeaking();
  }, [id]);

  const available = engine !== 'off' && (browserVoicesSupported() || cloudReady);
  return { speak, stop, speaking, available };
}
