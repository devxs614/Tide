'use client';

// A day's events as a list (v2.1 F-10): each title opens the event's
// details (F-04), with its time and place underneath.
import { ChevronRight } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { openEventDetail } from '@/lib/eventSheets';
import { formatTime } from '@/lib/time';
import type { CalendarEvent } from '@/lib/types';

export function EventRows({ events }: { events: CalendarEvent[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {events.map((e) => (
        <li key={e.id} className="flex flex-col border-l-4 border-line bg-surface py-2 pr-3 pl-4">
          <button
            type="button"
            onClick={() => openEventDetail(e.id)}
            data-small-target-ok
            data-demo-id={`event-open-${e.id}`}
            className="flex items-start justify-between gap-1 rounded-md text-left font-bold hover:underline hover:underline-offset-4"
          >
            <span className="min-w-0 break-words">{e.title}</span>
            <ChevronRight aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-soft" />
          </button>
          <span className="text-caption text-ink-soft">
            {fill(copy.today.eventTime, { start: formatTime(e.start), end: formatTime(e.end) })}
            {e.place && ` · ${e.place}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
