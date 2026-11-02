'use client';

// "Add an event" from Today: a class, a lab, a shift. Events stay on the
// device. Prep items ("Calculator") show up later in the Bridge checklist
// when it's time to switch to this event. The fields are shared with
// "Edit event" (v2.1 F-04) in components/events/EventFields.tsx.
import { useState } from 'react';
import { Info } from 'lucide-react';
import { copy } from '@/copy/en';
import { addEvent } from '@/lib/repo/events';
import { atTime } from '@/lib/repo/eventEdits';
import { toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EventFields, PrepFields, type EventFieldValues } from '@/components/events/EventFields';
import { LeaveConfirm } from '@/components/checkin/LeaveConfirm';

const blank = (dayStart: number): EventFieldValues => ({
  title: '',
  kind: 'class',
  date: toISODate(dayStart),
  start: '09:00',
  end: '10:00',
  place: '',
  prep: ['', '', ''],
});

export function AddEventSheet({ open, onOpenChange, dayStart }: { open: boolean; onOpenChange: (o: boolean) => void; dayStart: number }) {
  const [values, setValues] = useState<EventFieldValues>(() => blank(dayStart));
  const [problem, setProblem] = useState<string | null>(null);
  // v2.1 F-08: closing with a name typed asks first.
  const [confirmLeave, setConfirmLeave] = useState(false);
  const dirty = values.title.trim().length > 0;

  const save = async () => {
    if (!values.title.trim()) return setProblem(copy.eventForm.nameNeeded);
    const date = toISODate(dayStart);
    const startTs = atTime(date, values.start);
    const endTs = atTime(date, values.end);
    if (endTs <= startTs) return setProblem(copy.eventForm.endBeforeStart);
    await addEvent({ title: values.title, kind: values.kind, start: startTs, end: endTs, place: values.place, prep: values.prep });
    // Kind and times stay as they were, so a second class is quick to add.
    setValues({ ...values, title: '', place: '', prep: ['', '', ''] });
    setProblem(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => (next || !dirty ? onOpenChange(next) : setConfirmLeave(true))}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{copy.eventForm.title}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col gap-4 px-5 pt-4 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <EventFields value={values} onChange={setValues} />
          <PrepFields legend={copy.eventForm.prepLabel} items={values.prep} onChange={(prep) => setValues({ ...values, prep })} />
          {problem && (
            <p className="flex items-center gap-2 text-notice" role="status">
              <Info className="size-4 shrink-0" aria-hidden />
              {problem}
            </p>
          )}
          <Button type="submit" size="block">
            {copy.eventForm.save}
          </Button>
        </form>
        <LeaveConfirm
          open={confirmLeave}
          onKeep={() => setConfirmLeave(false)}
          onLeave={() => {
            setConfirmLeave(false);
            setValues(blank(dayStart));
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
