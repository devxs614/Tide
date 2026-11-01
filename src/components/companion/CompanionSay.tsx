'use client';

// The companion's speech bubble (v2 spec 8.6, rebuilt in v2.1 F-01). The
// bubble used to live inside the companion's box, so cards, the top bar, the
// shore's SVG and sheets clipped or covered it, and long lines at big text
// sizes lost words. Now it floats in a portal on the nearest overlay layer,
// placed by Floating UI next to the companion's body: it flips and slides to
// stay on screen, never gets narrower than its words need, and scrolls inside
// itself in the rare case it would be taller than the screen.
// In a sheet header it can also sit inline, beside the companion, where it
// can neither be clipped nor cover the title.
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { arrow, autoUpdate, flip, offset, shift, size, useFloating, type Placement } from '@floating-ui/react-dom';
import { X } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { overlayRootFor } from '@/lib/overlay/overlayRoot';
import { cn } from '@/lib/utils';

// Only one bubble anywhere: a new line replaces the one showing.
let owner = '';
const listeners = new Set<() => void>();
function claim(id: string) {
  owner = id;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Long enough to read at any text size: about half a second a word, more
// when the text is bigger (reading big text is slower), never under 3.5s.
export function visibleMs(text: string, textScale = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3500, words * 450 * textScale + 1500);
}

export interface CompanionSayProps {
  text: string;
  // Changing the key shows the bubble again, even for the same words.
  lineKey: number;
  onDone?: () => void;
  // The companion it belongs to. Floating bubbles wait until it's on the page.
  anchor?: Element | null;
  // Beside the companion in the flow (sheet headers), instead of floating.
  inline?: boolean;
  // The person tapped the companion: a close button, and the companion
  // button describes itself with the bubble instead of a live region.
  tapped?: boolean;
  id?: string;
  className?: string;
}

export function CompanionSay({ text, lineKey, onDone, anchor, inline = false, tapped = false, id: givenId, className }: CompanionSayProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  const { settings } = useSettings();
  const current = useSyncExternalStore(subscribe, () => owner, () => '');
  const [pinned, setPinned] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seenKey, setSeenKey] = useState(lineKey);
  if (seenKey !== lineKey) {
    setSeenKey(lineKey);
    setPinned(false);
  }
  const shown = !!text && current === id;

  useEffect(() => {
    if (text) claim(id);
  }, [text, lineKey, id]);

  useEffect(() => {
    if (!text || pinned || paused) return;
    const t = window.setTimeout(() => onDone?.(), visibleMs(text, settings.textScale));
    return () => window.clearTimeout(t);
  }, [text, lineKey, pinned, paused, settings.textScale, onDone]);

  // Escape closes the bubble. A bubble someone kept open (pinned or tapped)
  // takes that Escape for itself, so the sheet behind it stays open.
  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (pinned || tapped) e.stopPropagation();
      onDone?.();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [shown, pinned, tapped, onDone]);

  if (!shown) return null;
  const body = (
    <BubbleBody
      id={id}
      text={text}
      live={!tapped}
      closable={pinned || tapped}
      onClose={() => onDone?.()}
      onPin={() => setPinned(true)}
      onPause={setPaused}
    />
  );
  if (inline) return <div className={cn('relative min-w-0', className)}>{body}</div>;
  if (!anchor) return null;
  return (
    <FloatingBubble anchor={anchor} lineKey={lineKey}>
      {body}
    </FloatingBubble>
  );
}

function FloatingBubble({ anchor, lineKey, children }: { anchor: Element; lineKey: number; children: ReactNode }) {
  // The body group, not the whole SVG box: the box has empty space around
  // the figure, which pushed the bubble away from the companion.
  const reference = useMemo(() => anchor.querySelector('.cmp-fig') ?? anchor, [anchor]);
  const root = useMemo(() => overlayRootFor(anchor), [anchor]);
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
    strategy: 'fixed',
    placement: preferred,
    elements: { reference, floating: bubble },
    middleware: [
      offset(10),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.maxWidth = `${Math.min(320, availableWidth)}px`;
          elements.floating.style.maxHeight = `${Math.max(64, availableHeight - 12)}px`;
        },
      }),
      arrow({ element: tail, padding: 16 }),
    ],
    whileElementsMounted: (ref, floating, update) => autoUpdate(ref, floating, update, { layoutShift: true }),
  });
  const below = placement.startsWith('bottom');
  const tailX = middlewareData.arrow?.x;
  return createPortal(
    <div ref={setBubble} style={floatingStyles} data-overlay="bubble" className="z-(--z-bubble) flex">
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

function BubbleBody({
  id,
  text,
  live,
  closable,
  onClose,
  onPin,
  onPause,
}: {
  id: string;
  text: string;
  live: boolean;
  closable: boolean;
  onClose: () => void;
  onPin: () => void;
  onPause: (paused: boolean) => void;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [scrolls, setScrolls] = useState(false);
  // Very rarely (a tiny screen, the largest text) the words won't fit: then
  // the bubble scrolls inside itself and can be scrolled from the keyboard.
  // Nothing is ever cut.
  useEffect(() => {
    const el = textRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setScrolls(el.scrollHeight > el.clientHeight + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      id={id}
      data-companion-bubble
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
      onClick={onPin}
      onPointerEnter={() => onPause(true)}
      onPointerLeave={() => onPause(false)}
      onFocus={() => onPause(true)}
      onBlur={() => onPause(false)}
      onTouchStart={() => onPause(true)}
      className="anim-pop relative flex max-h-full min-w-0 cursor-default"
    >
      <p
        ref={textRef}
        data-bubble-text
        lang="en"
        tabIndex={scrolls ? 0 : undefined}
        className={cn(
          'card-flat min-h-0 min-w-[120px] overflow-y-auto px-4 py-3 font-display text-[0.95rem] leading-snug font-semibold whitespace-normal text-ink hyphens-auto [overflow-wrap:anywhere]',
          closable && 'pr-10',
        )}
      >
        {text}
      </p>
      {closable && (
        <button
          type="button"
          aria-label={copy.companionBubble.close}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-1 -right-1 flex size-11 items-center justify-center rounded-full"
        >
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-line bg-surface text-ink">
            <X aria-hidden className="size-4" />
          </span>
        </button>
      )}
    </div>
  );
}
