'use client';

// "Next: Calculus · 4:50 pm · in 70 min", for the next event that starts in
// the next three hours. When it gets within 15 minutes, Today swaps this for
// the Bridge card that helps Maya make the switch.
import { CalendarClock } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { formatTime, minutesUntil } from '@/lib/time';
import type { CalendarEvent } from '@/lib/types';

export function NextTransitionCard({ event, nowTs }: { event: CalendarEvent; nowTs: number }) {
  return (
    <section aria-label={copy.today.nextEventLabel} className="flex items-center gap-3 card p-4">
      <CalendarClock className="size-6 shrink-0 text-primary" aria-hidden />
      <p className="font-bold">
        {fill(copy.today.nextEvent, { title: event.title, time: formatTime(event.start), minutes: minutesUntil(event.start, nowTs) })}
      </p>
    </section>
  );
}
