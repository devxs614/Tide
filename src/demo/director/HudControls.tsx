'use client';

// The tour bar's buttons (v2 spec 16.5), apart from the caption so that a
// new caption or a step of progress doesn't redraw them (demo fix pack,
// D-5). There is one play/pause button for the whole tour: only its icon,
// name and pressed state change, so a press that starts while the tour
// moves on still lands on the same button. It reacts to click only; a
// pointerdown toggle plus the click would count twice. Every button is at
// least 48 px, and play/pause is never folded away.
import { memo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { demoCopy } from '@/copy/demoCopy';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { director } from './engine';
import { DIRECTOR_SPEEDS } from './useDirectorKeys';

export const HudControls = memo(function HudControls({ paused, speed, captions, narration }: { paused: boolean; speed: number; captions: boolean; narration: boolean }) {
  const [more, setMore] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <WithTooltip label={copy.demo.previous}>
        <Button variant="quiet" size="icon" aria-label={copy.demo.previous} onClick={() => director.prev()}>
          <ChevronLeft aria-hidden />
        </Button>
      </WithTooltip>
      <WithTooltip label={paused ? copy.demo.play : copy.demo.pause}>
        <Button key="play-pause" variant="secondary" size="icon" aria-label={paused ? demoCopy.playDemo : demoCopy.pauseDemo} aria-pressed={paused} onClick={() => director.toggle('click')}>
          {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
        </Button>
      </WithTooltip>
      <WithTooltip label={copy.demo.next}>
        <Button variant="quiet" size="icon" aria-label={copy.demo.next} onClick={() => director.next()}>
          <ChevronRight aria-hidden />
        </Button>
      </WithTooltip>
      {/* At big text the three toggles fold behind "More controls", so the
          bar stays small enough to show what the tour is pointing at. */}
      <Button variant="quiet" size="sm" aria-expanded={more} className="hidden big-text:inline-flex" onClick={() => setMore(!more)}>
        {more ? copy.demo.fewerControls : copy.demo.moreControls}
      </Button>
      <span className={more ? 'contents' : 'contents big-text:hidden'}>
        <Button variant="quiet" size="sm" onClick={() => director.setSpeed(DIRECTOR_SPEEDS[(DIRECTOR_SPEEDS.indexOf(speed) + 1) % DIRECTOR_SPEEDS.length])}>
          {fill(copy.demo.speed, { x: speed })}
        </Button>
        <Button variant="quiet" size="sm" onClick={() => director.toggleCaptions()}>
          {captions ? copy.demo.captionsOn : copy.demo.captionsOff}
        </Button>
        <Button variant="quiet" size="sm" onClick={() => director.toggleNarration()}>
          {narration ? copy.demo.narrationOn : copy.demo.narrationOff}
        </Button>
      </span>
      <WithTooltip label={copy.demo.exit}>
        <Button variant="quiet" size="icon" className="ml-auto" aria-label={copy.demo.exit} onClick={() => director.exit()}>
          <X aria-hidden />
        </Button>
      </WithTooltip>
    </div>
  );
});
