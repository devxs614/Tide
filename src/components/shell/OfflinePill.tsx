'use client';

// "Offline · using built-in suggestions", a small pill under the top bar
// (v2 spec 17.2). It takes no space in the layout, fades in and out (or just
// appears at motion Off), and a separate polite status line tells screen
// reader users once, without stealing focus.
import { copy } from '@/copy/en';
import { useOnline } from '@/lib/useOnline';
import { cn } from '@/lib/utils';

export function OfflinePill() {
  const online = useOnline();
  return (
    <div data-overlay="chrome" className="pointer-events-none sticky top-16 z-(--z-sticky) flex h-0 justify-center">
      <p role="status" className="sr-only">
        {online ? '' : copy.shell.offline}
      </p>
      <span
        aria-hidden
        className={cn(
          // It used to be one unbreakable line: invisible, but still wider
          // than a narrow phone, so every screen scrolled sideways.
          'offline-pill mt-2 max-w-[calc(100vw-2rem)] rounded-card border-2 border-line bg-surface-2 px-3 py-1 text-center text-caption font-bold text-ink',
          !online && 'is-on',
        )}
      >
        {copy.shell.offline}
      </span>
    </div>
  );
}
