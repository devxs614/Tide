'use client';

// Step 3, "Choose a companion" (v2 spec 11.2): one big card at a time, the
// six companions and "No companion", each idling with its name, a line about
// its personality and "Say hi". Swipe, the arrow buttons or the arrow keys
// move between cards; the dots show where you are.
import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { companionLine } from '@/copy/companions';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { now } from '@/lib/clock';
import { COMPANIONS, SIZES, SPECIES, type CompanionSpecies } from '@/lib/companion/registry';
import { useSettings } from '@/lib/settings';
import { useSound } from '@/lib/sound/useSound';
import { dayPart, toISODate } from '@/lib/time';
import { useVoice } from '@/lib/voice/useVoice';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { Companion } from '@/components/companion/Companion';
import { CompanionSay } from '@/components/companion/CompanionSay';
import { NoneCompanion } from '@/components/companion/NoneCompanion';
import { cn } from '@/lib/utils';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

const CHOICES: Array<CompanionSpecies | 'none'> = [...SPECIES, 'none'];

export function CompanionStep({ onNext, goTo }: StepProps) {
  const { settings, updateMany } = useSettings();
  const play = useSound();
  const voice = useVoice();
  const current = settings['companion.species'];
  const [index, setIndex] = useState(() => Math.max(0, CHOICES.indexOf(current ?? 'otter')));
  const [hello, setHello] = useState<{ text: string; key: number } | null>(null);
  const touchX = useRef<number | null>(null);
  const choice = CHOICES[index];

  const move = (delta: number) => {
    setIndex((i) => (i + delta + CHOICES.length) % CHOICES.length);
    setHello(null);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowLeft') move(-1);
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
  };

  const sayHi = (species: CompanionSpecies) => {
    const text = companionLine(species, `greeting_${dayPart(now())}`, settings.communicationMode, { name: settings.name }, toISODate(now()));
    setHello((h) => ({ text, key: (h?.key ?? 0) + 1 }));
    play(`chirp-${species}`);
    if (voice.available && settings['voice.readCompanion']) void voice.speak(text);
  };

  const choose = async () => {
    await updateMany({ 'companion.species': choice, 'companion.variant': '', 'companion.accessory': 'none' });
    if (choice === 'none') goTo(6);
    else onNext();
  };

  const name = choice === 'none' ? copy.ob.noCompanion : COMPANIONS[choice].defaultName;
  return (
    <StepFrame
      title={copy.ob.companionTitle}
      sub={copy.ob.companionSub}
      action={choice === 'none' ? copy.ob.chooseNone : fill(copy.ob.choose, { name })}
      onAction={() => void choose()}
    >
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={copy.ob.carouselLabel}
        tabIndex={0}
        onKeyDown={onKey}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        className="flex items-center gap-2 rounded-card"
      >
        <WithTooltip label={copy.ob.previous}>
          <Button variant="quiet" size="icon" aria-label={copy.ob.previous} onClick={() => move(-1)}>
            <ChevronLeft aria-hidden />
          </Button>
        </WithTooltip>
        <div key={choice} className="stagger-in card flex flex-1 flex-col items-center gap-2 p-4 text-center" aria-live="polite">
          <div className="relative flex h-36 items-end">
            {hello && choice !== 'none' && (
              <CompanionSay text={hello.text} lineKey={hello.key} onDone={() => setHello(null)} className="absolute bottom-full left-1/2 mb-1 w-max -translate-x-1/2" />
            )}
            {choice === 'none' ? <NoneCompanion size={SIZES.lg} /> : <Companion override={{ species: choice }} size={SIZES.lg} />}
          </div>
          <h2 className="text-h2 font-extrabold">{name}</h2>
          <p className="text-ink-soft">
            {choice === 'none' ? copy.ob.noCompanionSub : `${COMPANION_COPY.species[choice].kind}. ${COMPANION_COPY.species[choice].personality}.`}
          </p>
          {choice !== 'none' && (
            <Button variant="secondary" size="sm" onClick={() => sayHi(choice)}>
              <MessageCircle aria-hidden />
              {copy.ob.sayHi}
            </Button>
          )}
        </div>
        <WithTooltip label={copy.ob.nextCompanion}>
          <Button variant="quiet" size="icon" aria-label={copy.ob.nextCompanion} onClick={() => move(1)}>
            <ChevronRight aria-hidden />
          </Button>
        </WithTooltip>
      </div>
      <div aria-hidden className="flex justify-center gap-2">
        {CHOICES.map((c, i) => (
          <span key={c} className={cn('size-2.5 rounded-full', i === index ? 'bg-primary' : 'bg-line')} />
        ))}
      </div>
    </StepFrame>
  );
}
