'use client';

// The round "Check in" button above the tab bar (v2 spec 4.4). It presses
// down into its ledge, sends out a soft ripple, and at the Lively motion
// level it "breathes" very slowly. At rest it looks exactly as before.
// v2.3 Item 1: the team found it sitting over cards and text on every
// screen, so in "smart" mode (the default) it now shows only on the main
// tabs and the calendar, steps aside while a sheet is open or a field has
// focus, hides as you scroll down and comes back as you scroll up, shrinks
// to its circle when it would cover something (or at big text), shows the
// last check-in's state as a ring, and opens Quick check-in on a long press,
// a right-click or Shift+Enter. "In the tab bar" and "Hidden" modes don't
// draw it at all (the tab bar and the menu take over).
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { WavesHorizontal } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { checkinButtonCopy } from '@/copy/checkinButtonCopy';
import { useCheckInSheet } from '@/lib/ui';
import { useFeedback } from '@/lib/sound/useFeedback';
import { usePauseOffscreen } from '@/lib/motion/usePauseOffscreen';
import { useReducedMotionPref, useSettings } from '@/lib/settings';
import { anyOverlayOpen, subscribeOpenOverlays } from '@/lib/backToClose';
import { latestCheckIn } from '@/lib/repo/checkins';
import { openQuickCheckIn } from '@/lib/checkin/quickCheckIn';
import { fabCompact, fabShowsOn, ringFor, SCROLL_START, scrollStep } from '@/lib/checkin/fabRules';
import { now } from '@/lib/clock';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { QuadrantDot } from '@/components/ui/QuadrantDot';
import { HintLabel } from '@/components/ui/hint-label';
import { useFabPlacement } from './useFabPlacement';

const LONG_PRESS_MS = 500;
const SIDE = { left: 'justify-start pl-4', center: 'justify-center', right: 'justify-end pr-4' } as const;

export function CheckInFab() {
  const { settings } = useSettings();
  const pathname = usePathname();
  const { openCheckIn } = useCheckInSheet();
  const overlayOpen = useSyncExternalStore(subscribeOpenOverlays, anyOverlayOpen, () => false);
  const reduceMotion = useReducedMotionPref();
  const latest = useLiveQuery(() => latestCheckIn(), []);
  const [ripple, setRipple] = useState(0);
  const [scroll, setScroll] = useState(SCROLL_START);
  const [focused, setFocused] = useState(false);
  const feedback = useFeedback();
  const pauseRef = usePauseOffscreen<HTMLSpanElement>();
  const button = useRef<HTMLButtonElement>(null);
  const pressTimer = useRef(0);
  const longPressed = useRef(false);
  const { typing, scrolling, overInteractive, nudge, frameWidth, drag } = useFabPlacement(button);

  // Scrolling down hides it, up brings it back (rAF-throttled, passive).
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScroll((s) => scrollStep(s, window.scrollY, max));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  if (settings['checkin.buttonMode'] !== 'smart' || !fabShowsOn(pathname)) return null;
  // Hidden while a sheet is open or a field has focus; never while it has
  // keyboard focus itself, so hiding never takes focus away.
  const away = !focused && (overlayOpen || typing || scroll.hidden);
  const compact = fabCompact({ textScale: settings.textScale, frameWidth, scrolling, overInteractive });
  const ring = ringFor(latest, now());
  const label = copy.shell.checkIn;
  const quick = () => {
    longPressed.current = true;
    openQuickCheckIn();
  };

  return (
    <div data-overlay="fab" className={cn('pointer-events-none flex pb-1', SIDE[settings['checkin.buttonSide']])}>
      <button
          ref={button}
          data-demo-id="fab-checkin"
          type="button"
          aria-label={label}
          aria-describedby={ring ? 'fab-last-state' : undefined}
          aria-hidden={away || undefined}
          tabIndex={away ? -1 : undefined}
          onClick={() => {
            // A long press already opened Quick check-in.
            if (longPressed.current) return void (longPressed.current = false);
            feedback('tap');
            openCheckIn();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            quick();
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' && e.shiftKey) || e.key === 'ContextMenu') {
              e.preventDefault();
              quick();
            }
          }}
          onPointerDown={(e) => {
            setRipple((n) => n + 1);
            longPressed.current = false;
            window.clearTimeout(pressTimer.current);
            pressTimer.current = window.setTimeout(() => (settings['checkin.buttonMovable'] ? drag.arm(e.clientX) : quick()), LONG_PRESS_MS);
          }}
          onPointerMove={(e) => drag.move(e.clientX)}
          onPointerUp={(e) => {
            window.clearTimeout(pressTimer.current);
            if (drag.end(e.clientX)) longPressed.current = true;
            else if (drag.armedWithoutMove()) quick();
          }}
          onPointerLeave={() => window.clearTimeout(pressTimer.current)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={drag.dx || nudge || away ? { transform: `translateX(${drag.dx + nudge}px)${away ? ' scale(0.8)' : ''}` } : undefined}
          className={cn(
            'group pointer-events-auto relative flex flex-col items-center gap-1 rounded-full',
            !reduceMotion && 'transition-[opacity,transform] duration-200',
            away && 'pointer-events-none opacity-0',
          )}
        >
          <span ref={pauseRef} className="fab-breath relative">
            <span
              className="press-3d relative flex size-[68px] items-center justify-center overflow-hidden rounded-full bg-primary text-on-primary [--ledge-color:var(--primary-shadow)] [--press-depth:5px] group-active:translate-y-[5px] group-active:shadow-none"
              style={ring ? { outline: `3px solid var(--q-${ring})`, outlineOffset: '2px' } : undefined}
            >
              <WavesHorizontal className="size-8 stroke-[2.5]" aria-hidden />
              {/* pointer-events-none: each tap swaps this span for a new one,
                  and a press that starts on an element that then disappears
                  never becomes a click. Every tap after the first was lost
                  (v2.1, found while testing F-08). */}
              {ripple > 0 && (
                <span
                  key={ripple}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full bg-on-primary/40 [animation:tide-ripple_600ms_var(--ease-out)_forwards]"
                />
              )}
            </span>
            {ring && <QuadrantDot quadrant={ring} className="absolute -top-1 -right-1 size-3.5" />}
          </span>
          <span className={cn('rounded-full bg-bg/90 px-2 font-display text-[0.8235rem] font-extrabold text-ink', compact && 'sr-only')} aria-hidden>
            {label}
          </span>
          <HintLabel label={label} show={compact} />
        </button>
      {ring && latest && (
        <span id="fab-last-state" className="sr-only">
          {fill(checkinButtonCopy.lastState, { quadrant: copy.quadrants[ring].name, time: formatTime(latest.ts) })}
        </span>
      )}
    </div>
  );
}
