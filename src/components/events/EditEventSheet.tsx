'use client';

// "Edit event" (v2.1 F-04): the Add form's fields plus the date, five prep
// slots, and for a weekly series the days it repeats on. Saving an event in
// a series asks which events to change; a new date can only move this one
// event, and new days only apply from this date on.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Info } from 'lucide-react';
import { copy } from '@/copy/en';
import { eventEditCopy as t } from '@/copy/eventEditCopy';
import { getEvent, getSeries } from '@/lib/repo/eventQueries';
import { editEvent, eventProblem, hhmm, type SeriesScope } from '@/lib/repo/eventEdits';
import { toISODate } from '@/lib/time';
import type { CalendarEvent, EventSeries } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ToggleChip } from '@/components/checkin/ToggleChip';
import { EventFields, PrepFields, type EventFieldValues } from './EventFields';
import { weekdayLabel } from './EventDetailSheet';
import { ScopeDialog, type ScopeChoice } from './ScopeDialog';

const PROBLEMS = {
  nameNeeded: copy.eventForm.nameNeeded,
  endBeforeStart: copy.eventForm.endBeforeStart,
  crossesMidnight: t.crossesMidnight,
};
// Monday first, the way students read a week.
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const sameDays = (a: number[], b: number[]) => a.length === b.length && a.every((d) => b.includes(d));

export function EditEventSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const data = useLiveQuery(async () => {
    const event = await getEvent(id);
    return event ? { event, series: await getSeries(event.seriesId) } : null;
  }, [id]);
  if (!data) return null;
  return <EditEventForm key={data.event.id} event={data.event} series={data.event.detached ? undefined : data.series} onClose={onClose} />;
}

function EditEventForm({ event, series, onClose }: { event: CalendarEvent; series?: EventSeries; onClose: () => void }) {
  const initial: EventFieldValues = {
    title: event.title,
    kind: event.kind,
    date: toISODate(event.start),
    start: hhmm(event.start),
    end: hhmm(event.end),
    place: event.place ?? '',
    prep: [...(event.prep ?? []), '', '', '', '', ''].slice(0, 5),
  };
  const [values, setValues] = useState(initial);
  const [days, setDays] = useState<number[]>(series?.days ?? []);
  const [problem, setProblem] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [changePast, setChangePast] = useState(false);

  const dateChanged = values.date !== initial.date;
  const daysChanged = !!series && !sameDays(days, series.days);
  const timeChanged = values.start !== initial.start || values.end !== initial.end;

  const apply = async (scope: SeriesScope) => {
    await editEvent(event.id, { ...values, days: daysChanged ? days : undefined }, scope, { changePast });
    onClose();
  };

  const save = () => {
    const p = eventProblem(values);
    if (p) return setProblem(PROBLEMS[p]);
    if (series && days.length === 0) return setProblem(t.noDays);
    if (dateChanged && daysChanged) return setProblem(t.oneAtATime);
    setProblem(null);
    if (!series) return void apply('one');
    setAsking(true);
  };

  const choices: ScopeChoice[] = [
    ...(daysChanged ? [] : [{ scope: 'one' as const, label: t.scopeOne, demoId: 'event-scope-one' }]),
    ...(dateChanged ? [] : [{ scope: 'future' as const, label: t.scopeFuture }]),
    ...(dateChanged || daysChanged ? [] : [{ scope: 'all' as const, label: t.scopeAll }]),
  ];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{t.editTitle}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col gap-4 px-5 pt-4 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <EventFields value={values} onChange={setValues} date={{ label: t.dateLabel, help: series ? t.dateSeriesHelp : undefined }} />
          {series && (
            <fieldset className="flex flex-col gap-2" aria-describedby="event-days-help">
              <legend className="mb-2 font-bold">{t.repeatsOn}</legend>
              <div className="flex flex-wrap gap-2">
                {WEEK.map((d) => (
                  <ToggleChip
                    key={d}
                    label={weekdayLabel(d)}
                    pressed={days.includes(d)}
                    onToggle={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d])}
                  />
                ))}
              </div>
              <p id="event-days-help" className="text-caption text-ink-soft">
                {t.repeatsHelp}
              </p>
            </fieldset>
          )}
          <PrepFields legend={t.prepLabel} items={values.prep} onChange={(prep) => setValues({ ...values, prep })} />
          {problem && (
            <p className="flex items-center gap-2 text-notice" role="status">
              <Info className="size-4 shrink-0" aria-hidden />
              {problem}
            </p>
          )}
          <Button type="submit" size="block" data-demo-id="event-edit-save">
            {t.save}
          </Button>
        </form>
        {asking && (
          <ScopeDialog
            title={t.scopeTitle}
            body={t.scopeBody}
            choices={choices}
            cancelLabel={t.keepEditing}
            onCancel={() => setAsking(false)}
            onPick={(scope) => void apply(scope)}
          >
            {timeChanged && choices.some((c) => c.scope === 'all') && (
              <CheckboxRow id="event-change-past" label={t.changePast} checked={changePast} onCheckedChange={setChangePast} />
            )}
          </ScopeDialog>
        )}
      </SheetContent>
    </Sheet>
  );
}
