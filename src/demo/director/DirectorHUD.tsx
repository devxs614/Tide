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
// "Paused" when it is. With narration on, a freshly loaded tour waits here
// for play (D-2), and a device without any voice gets a one-time line.
// D-3: at the bottom it sits above the tab bar and the check-in button (at
// a height fixed for the step) and reserves its space, companion bubbles
// keep off it, and its caption hides while a celebration plays.
import { useLayoutEffect, useRef } from 'react';
import { copy } from '@/copy/en';
import { demoCopy } from '@/copy/demoCopy';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import { useCelebrationView } from '@/lib/celebrate/store';
import type { DirectorState } from './engine';
import { HudControls } from './HudControls';
import { useDirectorKeys } from './useDirectorKeys';

type HudState = DirectorState & { hudTop?: boolean; hudBottom?: number | null; needsTap?: boolean; notice?: string | null };

// How much of the bottom of the screen the bar takes (D-3), for the page's
// own toasts and the end of the page to stay clear of (globals.css reads
// it while a tour runs). Nothing is reserved while the bar is at the top.
function useReservedSpace(top: boolean) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || top) {
      root.style.removeProperty('--demo-hud-clear');
      return;
    }
    const write = () => root.style.setProperty('--demo-hud-clear', `${Math.ceil(window.innerHeight - el.getBoundingClientRect().top + 12)}px`);
    write();
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(write);
    resize?.observe(el);
    return () => {
      resize?.disconnect();
      root.style.removeProperty('--demo-hud-clear');
    };
  }, [top]);
  return ref;
}

export function DirectorHUD({ state }: { state: HudState }) {
  useDirectorKeys();
  const ref = useReservedSpace(!!state.hudTop);
  // No caption over or behind a celebration (D-3); the progress and the
  // controls stay, above it.
  const celebrating = !!useCelebrationView();
  const total = state.script?.steps.length ?? 1;
  return (
    <section
      ref={ref}
      data-demo-hud
      data-overlay="demo"
      data-overlay-root
      // Companion bubbles keep off the bar (D-3).
      data-bubble-avoid
      aria-label={copy.demo.hudLabel}
      className={cn('card pointer-events-auto fixed inset-x-4 z-[calc(var(--z-demo)+2)] mx-auto flex max-w-[400px] flex-col gap-2 p-3', state.hudTop && 'top-4')}
      style={state.hudTop ? undefined : { bottom: state.hudBottom ?? 96 }}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-bold text-on-primary">{copy.demo.pill}</span>
        <span className="min-w-0 font-display font-extrabold">{state.chapterTitle}</span>
        <span aria-live="polite" className="ml-auto shrink-0 text-caption font-bold text-ink-soft">
          {state.paused ? demoCopy.paused : ''}
        </span>
      </div>
      <ProgressBar value={state.index} max={total} label={state.chapterTitle || copy.demo.pill} />
      {state.captions && !celebrating && (
        // Three lines on screen at most, so the controls never get pushed
        // away; screen readers still hear the whole caption.
        <p aria-live="polite" data-allow-clip className="line-clamp-3 min-h-12 text-[1.0625rem]">
          {state.caption}
        </p>
      )}
      {state.notice && !celebrating && <p className="text-caption text-ink-soft">{state.notice}</p>}
      {/* Waiting for the tap that lets narration speak, the button offers
          play, like a paused tour. */}
      <HudControls paused={state.paused || !!state.needsTap} speed={state.speed} captions={state.captions} narration={state.narration} />
    </section>
  );
}
