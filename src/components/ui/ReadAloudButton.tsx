'use client';

// "Read aloud" next to every AI suggestion and every strategy step. It uses
// the clearest English voice the device has, at the speed chosen in Settings,
// and turns into "Stop reading" while it talks. Hidden where speech isn't
// available.
import { useEffect, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { copy } from '@/copy/en';
import { isSpeechSupported, primeVoices, speak, stopSpeaking } from '@/lib/speech';
import { useSettings } from '@/lib/settings';
import { useIsClient } from '@/lib/useIsClient';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function ReadAloudButton({ text, className, label }: { text: string; className?: string; label?: string }) {
  const isClient = useIsClient();
  const { settings } = useSettings();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    primeVoices();
    return () => stopSpeaking();
  }, []);

  if (!isClient || !isSpeechSupported()) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, { rate: settings.readAloudRate, voiceName: settings.readAloudVoice }, () => setSpeaking(false));
  };

  return (
    <Button variant="quiet" size="sm" onClick={toggle} className={cn('self-start', className)} aria-pressed={speaking}>
      {speaking ? <Square aria-hidden /> : <Volume2 aria-hidden />}
      {speaking ? copy.global.stopReading : (label ?? copy.global.readAloud)}
    </Button>
  );
}
