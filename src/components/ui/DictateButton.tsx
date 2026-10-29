'use client';

// "Dictate" for the text fields that matter (check-in, parking note, brain
// dump, wins). What Maya says is appended to what she already typed. If the
// browser has no speech recognition the button is simply not there, with no
// error message to worry about.
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { copy } from '@/copy/en';
import { isDictationSupported, startDictation } from '@/lib/speech';
import { useIsClient } from '@/lib/useIsClient';
import { Button } from './button';

export function DictateButton({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const isClient = useIsClient();
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  if (!isClient || !isDictationSupported()) return null;

  const toggle = () => {
    if (listening) {
      stopRef.current?.();
      return;
    }
    const before = value.trim();
    setListening(true);
    stopRef.current = startDictation({
      onText: (spoken) => onChange(before ? `${before} ${spoken}` : spoken),
      onEnd: () => {
        setListening(false);
        stopRef.current = null;
      },
    });
  };

  return (
    <Button variant="secondary" size="sm" onClick={toggle} aria-pressed={listening}>
      {listening ? <MicOff aria-hidden /> : <Mic aria-hidden />}
      {listening ? copy.global.listening : copy.global.dictate}
    </Button>
  );
}
