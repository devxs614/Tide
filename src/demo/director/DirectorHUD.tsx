'use client';

// The tour's controls (v2 spec 16.5): the chapter, a progress bar, the
// caption, and real buttons for play/pause, back, next, speed, captions,
// narration and exit, with keyboard shortcuts (Space, arrows, PageUp/Down
// for clickers, Esc, S, C, N). It moves to the top when the spotlight is in
// the bottom third of the screen, so it never covers what's being shown.
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import { director, type DirectorState } from './engine';

const SPEEDS = [1, 1.5, 2];

export function DirectorHUD({ state }: { state: DirectorState }) {
  const total = state.script?.steps.length ?? 1;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.matches?.('input, textarea');
      if (typing) return;
      if (e.key === ' ') director.toggle();
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') director.next();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') director.prev();
      else if (e.key === 'Escape') director.exit();
      else if (e.key === 's') director.setSpeed(SPEEDS[(SPEEDS.indexOf(director.getState().speed) + 1) % SPEEDS.length]);
      else if (e.key === 'c') director.toggleCaptions();
      else if (e.key === 'n') director.toggleNarration();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const rect = state.target?.getBoundingClientRect();
  const top = !!rect && rect.top > window.innerHeight * 0.65;

  return (
    <section
      aria-label={copy.demo.hudLabel}
      className={cn('card fixed inset-x-4 z-[70] mx-auto flex max-w-[400px] flex-col gap-2 p-3', top ? 'top-4' : 'bottom-24')}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-bold text-on-primary">{copy.demo.pill}</span>
        <span className="truncate font-display font-extrabold">{state.chapterTitle}</span>
      </div>
      <ProgressBar value={state.index} max={total} label={state.chapterTitle || copy.demo.pill} />
      {state.captions && (
        <p aria-live="polite" className="line-clamp-2 min-h-12 text-[1.0625rem]">
          {state.caption}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1">
        <Button variant="quiet" size="icon" aria-label={copy.demo.previous} onClick={director.prev}>
          <ChevronLeft aria-hidden />
        </Button>
        <Button variant="secondary" size="icon" aria-label={state.paused ? copy.demo.play : copy.demo.pause} onClick={director.toggle}>
          {state.paused ? <Play aria-hidden /> : <Pause aria-hidden />}
        </Button>
        <Button variant="quiet" size="icon" aria-label={copy.demo.next} onClick={director.next}>
          <ChevronRight aria-hidden />
        </Button>
        <Button variant="quiet" size="sm" onClick={() => director.setSpeed(SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length])}>
          {fill(copy.demo.speed, { x: state.speed })}
        </Button>
        <Button variant="quiet" size="sm" onClick={director.toggleCaptions}>
          {state.captions ? copy.demo.captionsOn : copy.demo.captionsOff}
        </Button>
        <Button variant="quiet" size="sm" onClick={director.toggleNarration}>
          {state.narration ? copy.demo.narrationOn : copy.demo.narrationOff}
        </Button>
        <Button variant="quiet" size="icon" className="ml-auto" aria-label={copy.demo.exit} onClick={director.exit}>
          <X aria-hidden />
        </Button>
      </div>
    </section>
  );
}
