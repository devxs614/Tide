'use client';

// The companion's speech bubble (v2 spec 8.6): rounded, in the display font,
// with a tail pointing at the companion. It stays up long enough to read
// (2.5s, or about a third of a second per word plus 1.5s), a tap keeps it,
// and screen readers hear it politely. Only one bubble shows at a time
// anywhere in the app; a new line replaces the old one.
import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

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

export function visibleMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2500, words * 350 + 1500);
}

export function CompanionSay({
  text,
  lineKey,
  onDone,
  side = 'left',
  className,
}: {
  text: string;
  // Changing the key shows the bubble again, even for the same words.
  lineKey: number;
  onDone?: () => void;
  // Which way the bubble reaches from the companion it sits above (the
  // tail sits at the end nearest the companion), or inline, beside it.
  side?: 'left' | 'right' | 'inline';
  className?: string;
}) {
  const id = useId();
  const current = useSyncExternalStore(subscribe, () => owner, () => '');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!text) return;
    claim(id);
    if (pinned) return;
    const t = window.setTimeout(() => onDone?.(), visibleMs(text));
    return () => window.clearTimeout(t);
  }, [text, lineKey, pinned, id, onDone]);

  if (!text || current !== id) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => setPinned(true)}
      className={cn('anim-pop relative max-w-[260px] cursor-default', className)}
    >
      <p className="card-flat px-3.5 py-2 font-display text-[0.9412rem] font-semibold leading-snug text-ink">{text}</p>
      <span
        aria-hidden
        className={cn(
          'absolute size-3 border-line bg-surface',
          side === 'inline'
            ? 'top-1/2 -left-1.5 -translate-y-1/2 rotate-45 border-b-2 border-l-2'
            : cn('-bottom-1.5 rotate-45 border-r-2 border-b-2', side === 'left' ? 'right-6' : 'left-6'),
        )}
      />
    </div>
  );
}
