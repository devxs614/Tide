'use client';

// The month as a list (v2.1 F-10): one row per day, for large text and
// narrow screens where seven columns can't fit. Each row is a button to the
// day, with its events, tasks due and whether it was closed.
import { CheckSquare, Moon } from 'lucide-react';
import { calendarCopy as t } from '@/copy/calendarCopy';
import type { DaySummary } from '@/lib/calendar/data';
import { formatLongDate, formatTime, fromISODate } from '@/lib/time';
import { cn } from '@/lib/utils';
import { dayLabel } from './MonthGrid';

export function AgendaList({ dates, days, today, onOpen }: { dates: string[]; days: Record<string, DaySummary>; today: string; onOpen: (iso: string) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {dates.map((iso) => {
        const day = days[iso];
        return (
          <li key={iso}>
            <button
              type="button"
              aria-label={dayLabel(iso, day)}
              aria-current={iso === today ? 'date' : undefined}
              onClick={() => onOpen(iso)}
              className={cn('flex w-full flex-col gap-1 rounded-card border-2 p-3 text-left', iso === today ? 'border-primary' : 'border-line bg-surface')}
            >
              <span className="font-bold">{formatLongDate(fromISODate(iso))}</span>
              {day?.events.map((e) => (
                <span key={e.id} className="break-words">
                  {formatTime(e.start)} · {e.title}
                </span>
              ))}
              <span className="flex flex-wrap items-center gap-3 text-caption text-ink-soft">
                {day?.tasksDue ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckSquare aria-hidden className="size-4" />
                    {day.tasksDue}
                  </span>
                ) : null}
                {day?.closed && <Moon aria-hidden className="size-4" />}
                {!day?.events.length && !day?.tasksDue && !day?.closed && <span>{t.nothing}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
