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
    <div className="pointer-events-none sticky top-16 z-30 flex h-0 justify-center">
      <p role="status" className="sr-only">
        {online ? '' : copy.shell.offline}
      </p>
      <span
        aria-hidden
        className={cn(
          'offline-pill mt-2 rounded-full border-2 border-line bg-surface-2 px-3 py-1 text-caption font-bold whitespace-nowrap text-ink',
          !online && 'is-on',
        )}
      >
        {copy.shell.offline}
      </span>
    </div>
  );
}
