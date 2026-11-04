'use client';

// Where a floating speech bubble goes (v2.1 F-01, v2.3 Item 3): next to the
// companion's body, inside the phone frame and clipped to it, off the timer,
// inputs and primary buttons (avoidElements), never wider than 280px. When
// no side is free it says so (`onCollide`) and the line goes to the caption
// bar instead. Split from CompanionSay so it loads only when a bubble shows.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { arrow, autoUpdate, flip, offset, shift, size, useFloating, type Placement } from '@floating-ui/react-dom';
import { overlayRootFor } from '@/lib/overlay/overlayRoot';
import { avoidElements, type AvoidData } from '@/lib/overlay/avoidElements';
import { cn } from '@/lib/utils';

export function FloatingBubble({ anchor, lineKey, onCollide, children }: { anchor: Element; lineKey: number; onCollide: () => void; children: ReactNode }) {
  // The body group, not the whole SVG box: the box has empty space around
  // the figure, which pushed the bubble away from the companion.
  const reference = useMemo(() => anchor.querySelector('.cmp-fig') ?? anchor, [anchor]);
  const root = useMemo(() => overlayRootFor(anchor), [anchor]);
  // In the frame's own layer the bubble is placed inside the frame (and
  // clipped to it); in a sheet's layer it keeps v2.1's fixed placement.
  const frame = root.hasAttribute('data-frame-overlays') ? root.parentElement : null;
  const boundary = frame ?? 'clippingAncestors';
  // Above a companion in the lower half of the screen, below one in the
  // upper half, decided when each line appears.
  const preferred = useMemo<Placement>(() => {
    const r = anchor.getBoundingClientRect();
    return r.top + r.height / 2 > window.innerHeight / 2 ? 'top' : 'bottom';
    // lineKey isn't read here, but a new line is when to look again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, lineKey]);
  // The bubble and its tail, held in state rather than refs, so Floating UI
  // gets the elements themselves once they're on the page.
  const [tail, setTail] = useState<SVGSVGElement | null>(null);
  const [bubble, setBubble] = useState<HTMLDivElement | null>(null);
  const { floatingStyles, middlewareData, placement } = useFloating({
    strategy: frame ? 'absolute' : 'fixed',
    placement: preferred,
    elements: { reference, floating: bubble },
    middleware: [
      offset(10),
      // The edges are the frame's and the screen's, whichever is closer: on
      // a laptop the screen is far wider than the "phone" (v2.3 Item 3).
      flip({ padding: 12, boundary, rootBoundary: 'viewport' }),
      // Both ways: even when the companion is half below the fold, the
      // words stay on screen.
      shift({ padding: 12, crossAxis: true, boundary, rootBoundary: 'viewport' }),
      size({
        padding: 12,
        boundary,
        rootBoundary: 'viewport',
        apply({ availableWidth, availableHeight, elements }) {
          const frameRoom = (frame?.clientWidth ?? window.innerWidth) - 24;
          elements.floating.style.maxWidth = `${Math.min(280, availableWidth, frameRoom)}px`;
          elements.floating.style.maxHeight = `${Math.max(64, availableHeight - 12)}px`;
        },
      }),
      avoidElements(reference),
      arrow({ element: tail, padding: 16 }),
    ],
    // Also look again every 300ms while it shows: Today's cards arrive
    // after the greeting, and a primary button could land under it without
    // the companion moving (autoUpdate only watches the companion).
    whileElementsMounted: (ref, floating, update) => {
      const stop = autoUpdate(ref, floating, update, { layoutShift: true });
      const again = window.setInterval(update, 300);
      return () => {
        stop();
        window.clearInterval(again);
      };
    },
  });
  const collided = (middlewareData.avoidElements as AvoidData | undefined)?.collided ?? false;
  useEffect(() => {
    if (collided) onCollide();
  }, [collided, onCollide]);
  const below = placement.startsWith('bottom');
  const tailX = middlewareData.arrow?.x;
  return createPortal(
    <div ref={setBubble} style={floatingStyles} data-overlay="bubble" className={cn('pointer-events-auto z-(--z-bubble) flex', collided && 'invisible')}>
      {children}
      <svg
        ref={setTail}
        aria-hidden
        width={12}
        height={8}
        viewBox="0 0 12 8"
        className={cn('absolute', below ? '-top-[6px] rotate-180' : '-bottom-[6px]')}
        style={{ left: tailX ?? undefined }}
      >
        <path d="M1 0 L6 7 L11 0" fill="var(--surface)" stroke="var(--line)" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>,
    root,
  );
}
