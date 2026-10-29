'use client';

// "Read aloud" next to every AI suggestion and every strategy step. Since v2
// it goes through the voice engine (lib/voice): the most natural voice
// available, text rewritten for speech, and long text read in pieces. It
// turns into "Stop reading" while it talks, with small sound bars that move
// only at the Lively motion level. Hidden where no voice can play.
import { Square, Volume2 } from 'lucide-react';
import { copy } from '@/copy/en';
import { useIsClient } from '@/lib/useIsClient';
import { useVoice } from '@/lib/voice/useVoice';
import { Button } from './button';
import { cn } from '@/lib/utils';

function SoundBars() {
  return (
    <span aria-hidden className="flex h-4 items-end gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="sound-bar w-1 rounded-full bg-current" style={{ animationDelay: `${i * 140}ms` }} />
      ))}
    </span>
  );
}

export function ReadAloudButton({ text, className, label }: { text: string; className?: string; label?: string }) {
  const isClient = useIsClient();
  const voice = useVoice();

  if (!isClient || !voice.available) return null;

  const toggle = () => {
    if (voice.speaking) voice.stop();
    else void voice.speak(text);
  };

  return (
    <Button variant="quiet" size="sm" onClick={toggle} className={cn('self-start', className)} aria-pressed={voice.speaking}>
      {voice.speaking ? <Square aria-hidden /> : <Volume2 aria-hidden />}
      {voice.speaking ? copy.global.stopReading : (label ?? copy.global.readAloud)}
      {voice.speaking && <SoundBars />}
    </Button>
  );
}
