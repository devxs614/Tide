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
// v2.3 Item 3: floating bubbles stay inside the phone frame (they're placed
// within it and clipped to it), keep off the timer, inputs and primary
// buttons (avoidElements), step aside when a sheet opens, and follow the
// speech style: bubbles, the caption bar, or no words on screen.
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { anyOverlayOpen, subscribeOpenOverlays } from '@/lib/backToClose';
import { recordLine, showCaption } from '@/lib/companion/speech';
import { cn } from '@/lib/utils';

// The floating placement (Floating UI and the avoid rule) loads when a
// bubble first shows, not with the page, so Today's first load stays within
// its budget (v2.3 Item 3).
const FloatingBubble = dynamic(() => import('./FloatingBubble').then((m) => m.FloatingBubble), { ssr: false });

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
  const style = settings['companion.speechStyle'];
  // A bubble on the page (not inside a sheet or dialog) steps aside as soon
  // as a sheet opens: before, it stayed and the page's companion and words
  // could show at the sheet's edge.
  const overlayOpen = useSyncExternalStore(subscribeOpenOverlays, anyOverlayOpen, () => false);
  const onPage = !inline && !!anchor && !anchor.closest('[data-slot="sheet-content"], [role="dialog"], [role="alertdialog"]');
  // Lines go to the caption bar instead of a bubble when Maya chose
  // captions, or when no side of the companion is free (`collided`).
  const [collided, setCollided] = useState(-1);
  const toCaption = shown && !inline && !tapped && (style === 'captions' || collided === lineKey);

  useEffect(() => {
    if (text) claim(id);
  }, [text, lineKey, id]);

  useEffect(() => {
    if (shown) recordLine(text);
  }, [shown, text, lineKey]);

  useEffect(() => {
    if (toCaption) showCaption(text);
  }, [toCaption, text, lineKey]);

  useEffect(() => {
    if (shown && onPage && overlayOpen) onDone?.();
  }, [shown, onPage, overlayOpen, onDone]);

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
  // "No speech" shows no words unless Maya tapped the companion to hear it.
  if (!anchor || toCaption || (style === 'off' && !tapped)) return null;
  return (
    <FloatingBubble anchor={anchor} lineKey={lineKey} onCollide={() => setCollided(lineKey)}>
      {body}
    </FloatingBubble>
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
        // v2.2 B-03: this was `overflow-wrap: anywhere` with hyphenation,
        // which let a squeezed bubble split ordinary words. `break-words`
        // only splits a word that can't fit on a line by itself, and the
        // 120px minimum keeps the bubble from getting that narrow.
        className={cn(
          'card-flat min-h-0 min-w-[120px] overflow-y-auto px-4 py-3 font-display text-[0.95rem] leading-snug font-semibold whitespace-normal text-ink break-words',
          closable && 'pr-10',
        )}
      >
        {text}
      </p>
      {closable && (
        <button
          type="button"
          data-overlay="bubble-close"
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
