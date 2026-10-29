'use client';

// "Add an event" from Today: a class, a lab, a shift. Events stay on the
// device. Prep items ("Calculator") show up later in the Bridge checklist
// when it's time to switch to this event.
import { useState } from 'react';
import { Info } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { addEvent } from '@/lib/repo/events';
import type { EventKind } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ToggleChip } from '@/components/checkin/ToggleChip';

function atTime(dayStart: number, hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(dayStart);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

const KINDS = Object.entries(copy.eventForm.kinds) as Array<[EventKind, string]>;

export function AddEventSheet({ open, onOpenChange, dayStart }: { open: boolean; onOpenChange: (o: boolean) => void; dayStart: number }) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('class');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [place, setPlace] = useState('');
  const [prep, setPrep] = useState(['', '', '']);
  const [problem, setProblem] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim()) return setProblem(copy.eventForm.nameNeeded);
    const startTs = atTime(dayStart, start);
    const endTs = atTime(dayStart, end);
    if (endTs <= startTs) return setProblem(copy.eventForm.endBeforeStart);
    await addEvent({ title, kind, start: startTs, end: endTs, place, prep });
    setTitle('');
    setPlace('');
    setPrep(['', '', '']);
    setProblem(null);
    onOpenChange(false);
  };

  const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{copy.eventForm.title}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-5 pt-4 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="event-title" className="font-bold">
              {copy.eventForm.nameLabel}
            </label>
            <input id="event-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} className={field} />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{copy.eventForm.kindLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(([id, label]) => (
                <ToggleChip key={id} label={label} pressed={kind === id} onToggle={() => setKind(id)} />
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="event-start" className="font-bold">
                {copy.eventForm.startLabel}
              </label>
              <input id="event-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={field} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="event-end" className="font-bold">
                {copy.eventForm.endLabel}
              </label>
              <input id="event-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="event-place" className="font-bold">
              {copy.eventForm.placeLabel}
            </label>
            <input id="event-place" value={place} maxLength={60} onChange={(e) => setPlace(e.target.value)} className={field} />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{copy.eventForm.prepLabel}</legend>
            {prep.map((item, i) => (
              <input
                key={i}
                aria-label={fill(copy.eventForm.prepItem, { n: i + 1 })}
                value={item}
                maxLength={60}
                onChange={(e) => setPrep(prep.map((p, j) => (j === i ? e.target.value : p)))}
                className={field}
              />
            ))}
          </fieldset>
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
      </SheetContent>
    </Sheet>
  );
}
