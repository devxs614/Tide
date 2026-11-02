'use client';

// "Next: Calculus · 4:50 pm · in 70 min", for the next event that starts in
// the next three hours. When it gets within 15 minutes, Today swaps this for
// the Bridge card that helps Maya make the switch. Since v2.1 (F-04) tapping
// it opens the event's details.
import { CalendarClock, ChevronRight } from 'lucide-react';
import { openEventDetail } from '@/lib/eventSheets';
import { copy, fill } from '@/copy/en';
import { formatTime, minutesUntil } from '@/lib/time';
import type { CalendarEvent } from '@/lib/types';

export function NextTransitionCard({ event, nowTs }: { event: CalendarEvent; nowTs: number }) {
  return (
    <section aria-label={copy.today.nextEventLabel} className="flex items-center gap-3 card p-4">
      <CalendarClock className="size-6 shrink-0 text-primary" aria-hidden />
      <button
        type="button"
        onClick={() => openEventDetail(event.id)}
        data-small-target-ok
        className="flex min-w-0 flex-1 items-start justify-between gap-1 rounded-md text-left font-bold hover:underline hover:underline-offset-4"
      >
        <span className="min-w-0 break-words">
          {fill(copy.today.nextEvent, { title: event.title, time: formatTime(event.start), minutes: minutesUntil(event.start, nowTs) })}
        </span>
        <ChevronRight aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-soft" />
      </button>
    </section>
  );
}
