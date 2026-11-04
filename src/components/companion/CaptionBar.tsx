'use client';

// The caption bar (v2.3 Item 3): a slim strip at the top of the frame, under
// the top bar, with a small companion head and its line. It sits in the
// page's flow, so it pushes content down instead of covering it, and it
// stays put while scrolling, like the top bar. It's used when Maya chose
// "Caption bar" in Settings → Companion, and as the fallback when a bubble
// can't find a spot that doesn't cover the timer, an input or a button.
// The live region is always there, so screen readers hear each new line.
import { useEffect } from 'react';
import { clearCaption, useCaption } from '@/lib/companion/speech';
import { useSettings } from '@/lib/settings';
import { visibleMs } from './CompanionSay';
import { LazyCompanion as Companion } from './LazyCompanion';

export function CaptionBar({ top }: { top: 0 | 16 }) {
  const caption = useCaption();
  const { settings } = useSettings();
  useEffect(() => {
    if (!caption) return;
    const t = window.setTimeout(() => clearCaption(caption.key), visibleMs(caption.text, settings.textScale));
    return () => window.clearTimeout(t);
  }, [caption, settings.textScale]);
  return (
    // Sticky chrome, like the top bar it sits under: content scrolls beneath
    // it, and at the top of the page it pushes content down instead.
    <div aria-live="polite" data-overlay="chrome" className={top === 0 ? 'sticky top-0 z-(--z-sticky)' : 'sticky top-16 z-(--z-sticky)'}>
      {caption && (
        <p key={caption.key} data-companion-caption className="flow-enter flex items-center gap-3 border-b-2 border-line bg-surface px-5 py-2 font-display font-semibold text-ink break-words">
          <Companion size={32} decorative />
          <span className="min-w-0 flex-1">{caption.text}</span>
        </p>
      )}
    </div>
  );
}
