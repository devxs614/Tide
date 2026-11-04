'use client';

// The tour's controls (v2 spec 16.5): the chapter, a progress bar, the
// caption, and real buttons for play/pause, back, next, speed, captions,
// narration and exit, with keyboard shortcuts (useDirectorKeys). It sits
// at the top for a step whose target is in the bottom third of the screen,
// or when the step says so (v2.1: an Undo toast or a check-in card that
// shows up at the bottom after the step's tap).
// Demo fix pack (D-5): the engine decides top or bottom once per step;
// before, every redraw measured the target again, and the bar could jump
// from the bottom to the top under a finger. It takes presses even while a
// sheet is open (Radix turns pointer events off for everything outside a
// sheet, so Pause couldn't be pressed during the check-in), and it says
// "Paused" when it is.
import { copy } from '@/copy/en';
import { demoCopy } from '@/copy/demoCopy';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import type { DirectorState } from './engine';
import { HudControls } from './HudControls';
import { useDirectorKeys } from './useDirectorKeys';

export function DirectorHUD({ state }: { state: DirectorState & { hudTop?: boolean } }) {
  useDirectorKeys();
  const total = state.script?.steps.length ?? 1;
  return (
    <section
      data-demo-hud
      data-overlay="demo"
      data-overlay-root
      aria-label={copy.demo.hudLabel}
      className={cn('card pointer-events-auto fixed inset-x-4 z-[calc(var(--z-demo)+2)] mx-auto flex max-w-[400px] flex-col gap-2 p-3', state.hudTop ? 'top-4' : 'bottom-24')}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-bold text-on-primary">{copy.demo.pill}</span>
        <span className="min-w-0 font-display font-extrabold">{state.chapterTitle}</span>
        <span aria-live="polite" className="ml-auto shrink-0 text-caption font-bold text-ink-soft">
          {state.paused ? demoCopy.paused : ''}
        </span>
      </div>
      <ProgressBar value={state.index} max={total} label={state.chapterTitle || copy.demo.pill} />
      {state.captions && (
        // Three lines on screen at most, so the controls never get pushed
        // away; screen readers still hear the whole caption.
        <p aria-live="polite" data-allow-clip className="line-clamp-3 min-h-12 text-[1.0625rem]">
          {state.caption}
        </p>
      )}
      <HudControls paused={state.paused} speed={state.speed} captions={state.captions} narration={state.narration} />
    </section>
  );
}
