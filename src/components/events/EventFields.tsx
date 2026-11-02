'use client';

// The fields of an event form, shared by "Add an event" (v1) and "Edit
// event" (v2.1 F-04) so both ask the same way: name, kind, optionally the
// date, start and end, place, and things to bring. The parent keeps the
// values; this only draws them.
import { copy, fill } from '@/copy/en';
import type { EventKind } from '@/lib/types';
import { ToggleChip } from '@/components/checkin/ToggleChip';

export interface EventFieldValues {
  title: string;
  kind: EventKind;
  date: string;
  start: string;
  end: string;
  place: string;
  prep: string[];
}

const KINDS = Object.entries(copy.eventForm.kinds) as Array<[EventKind, string]>;
const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';

export function EventFields({
  value,
  onChange,
  date,
}: {
  value: EventFieldValues;
  onChange: (next: EventFieldValues) => void;
  // Edit mode shows the date, with a line under it for series events.
  date?: { label: string; help?: string };
}) {
  const set = <K extends keyof EventFieldValues>(key: K, v: EventFieldValues[K]) => onChange({ ...value, [key]: v });
  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="event-title" className="font-bold">
          {copy.eventForm.nameLabel}
        </label>
        <input id="event-title" value={value.title} maxLength={80} onChange={(e) => set('title', e.target.value)} className={field} />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">{copy.eventForm.kindLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map(([id, label]) => (
            <ToggleChip key={id} label={label} pressed={value.kind === id} onToggle={() => set('kind', id)} />
          ))}
        </div>
      </fieldset>
      {date && (
        <div className="flex flex-col gap-1">
          <label htmlFor="event-date" className="font-bold">
            {date.label}
          </label>
          <input
            id="event-date"
            type="date"
            value={value.date}
            onChange={(e) => e.target.value && set('date', e.target.value)}
            aria-describedby={date.help ? 'event-date-help' : undefined}
            className={field}
          />
          {date.help && (
            <p id="event-date-help" className="text-caption text-ink-soft">
              {date.help}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="event-start" className="font-bold">
            {copy.eventForm.startLabel}
          </label>
          <input id="event-start" type="time" value={value.start} onChange={(e) => set('start', e.target.value)} className={field} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="event-end" className="font-bold">
            {copy.eventForm.endLabel}
          </label>
          <input id="event-end" type="time" value={value.end} onChange={(e) => set('end', e.target.value)} className={field} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="event-place" className="font-bold">
          {copy.eventForm.placeLabel}
        </label>
        <input id="event-place" value={value.place} maxLength={60} onChange={(e) => set('place', e.target.value)} className={field} />
      </div>
    </>
  );
}

// Prep items as their own fieldset, so each form can give it its own
// heading and number of slots (three when adding, as in v1; five when editing).
export function PrepFields({ legend, items, onChange }: { legend: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{legend}</legend>
      {items.map((item, i) => (
        <input
          key={i}
          aria-label={fill(copy.eventForm.prepItem, { n: i + 1 })}
          value={item}
          maxLength={60}
          onChange={(e) => onChange(items.map((p, j) => (j === i ? e.target.value : p)))}
          className={field}
        />
      ))}
    </fieldset>
  );
}
