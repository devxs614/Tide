'use client';

// An event's details (v2.1 F-04), opened by tapping it in the Tide Line or
// on the "Next" card: kind, date, time, place, what to bring, and how it
// repeats, with Edit and Delete. "Get ready" shows only when the switch to
// it is close enough for the Bridge to help.
import { useLiveQuery } from 'dexie-react-hooks';
import { Briefcase, CalendarDays, FlaskConical, GraduationCap, Heart, Pencil, Trash2, Users, type LucideIcon } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { eventEditCopy as t } from '@/copy/eventEditCopy';
import { now } from '@/lib/clock';
import { getEvent, getSeries } from '@/lib/repo/eventQueries';
import { useSettings } from '@/lib/settings';
import { formatLongDate, formatTime, fromISODate, MINUTE, shortWeekday } from '@/lib/time';
import { openEventDelete, openEventEdit } from '@/lib/eventSheets';
import { useBridgeSheet } from '@/lib/ui';
import type { EventKind } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const KIND_ICONS: Record<EventKind, LucideIcon> = {
  class: GraduationCap,
  lab: FlaskConical,
  work: Briefcase,
  social: Users,
  self_care: Heart,
  other: CalendarDays,
};

// Nov 1, 2026 was a Sunday, so day d of that week has weekday d.
export const weekdayLabel = (day: number) => shortWeekday(new Date(2026, 10, 1 + day).getTime());

export function daysList(days: number[]): string {
  const names = days.map(weekdayLabel);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} ${t.and} ${names.at(-1)}` : (names[0] ?? '');
}

export function EventDetailSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const lead = useSettings().settings['day.transitionLead'];
  const { openBridge } = useBridgeSheet();
  const data = useLiveQuery(async () => {
    const event = await getEvent(id);
    return event ? { event, series: await getSeries(event.seriesId) } : null;
  }, [id]);
  if (!data) return null;
  const { event, series } = data;
  const Icon = KIND_ICONS[event.kind];
  const at = now();
  const soon = event.start > at && event.start - at <= lead * MINUTE;
  const row = 'grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-2';
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle className="break-words">{event.title}</SheetTitle>
        </SheetHeader>
        <dl className={`${row} px-5 pt-3`}>
          <dt className="font-bold">{t.kindRow}</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <Icon aria-hidden className="size-4 shrink-0" />
            {copy.eventForm.kinds[event.kind]}
          </dd>
          <dt className="font-bold">{t.dateRow}</dt>
          <dd>{formatLongDate(event.start)}</dd>
          <dt className="font-bold">{t.timeRow}</dt>
          <dd>{fill(t.timeRange, { start: formatTime(event.start), end: formatTime(event.end) })}</dd>
          {event.place && (
            <>
              <dt className="font-bold">{t.placeRow}</dt>
              <dd className="min-w-0 break-words">{event.place}</dd>
            </>
          )}
          {event.prep && event.prep.length > 0 && (
            <>
              <dt className="font-bold">{t.prepRow}</dt>
              <dd className="min-w-0">
                <ul className="list-disc pl-5">
                  {event.prep.map((p) => (
                    <li key={p} className="break-words">
                      {p}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>
        {series && !event.detached && (
          <p className="px-5 pt-3 text-ink-soft">{fill(t.repeats, { days: daysList(series.days), until: formatLongDate(fromISODate(series.until)) })}</p>
        )}
        <div className="flex flex-wrap gap-2 px-5 pt-5 pb-6">
          {soon && (
            <Button
              onClick={() => {
                onClose();
                openBridge(event.id);
              }}
            >
              {t.getReady}
            </Button>
          )}
          <Button variant="secondary" onClick={() => openEventEdit(event.id)} data-demo-id="event-detail-edit">
            <Pencil aria-hidden />
            {t.edit}
          </Button>
          <Button variant="notice" onClick={() => openEventDelete(event.id)} data-demo-id="event-detail-delete">
            <Trash2 aria-hidden />
            {t.delete}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
