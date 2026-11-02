'use client';

// "Repeat" in the Add Event form (v2.1 F-10, spec 14.5): doesn't repeat,
// or every week on chosen weekdays (starting with the event's own) until a
// date, 8 weeks ahead by default and never more than 26.
import { calendarCopy as t } from '@/copy/calendarCopy';
import { latestUntil } from '@/lib/calendar/repeat';
import { ToggleChip } from '@/components/checkin/ToggleChip';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { weekdayLabel } from './EventDetailSheet';

// Monday first, the way students read a week.
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';

export interface RepeatValue {
  weekly: boolean;
  days: number[];
  until: string;
}

export function RepeatFields({ value, onChange, from }: { value: RepeatValue; onChange: (next: RepeatValue) => void; from: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span className="font-bold">{t.repeat}</span>
        <SegmentedControl
          label={t.repeat}
          value={value.weekly ? 'weekly' : 'once'}
          onChange={(v) => onChange({ ...value, weekly: v === 'weekly' })}
          options={[
            { value: 'once', label: t.noRepeat },
            { value: 'weekly', label: t.weekly },
          ]}
        />
      </div>
      {value.weekly && (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{t.repeatDays}</legend>
            <div className="flex flex-wrap gap-2">
              {WEEK.map((d) => (
                <ToggleChip
                  key={d}
                  label={weekdayLabel(d)}
                  pressed={value.days.includes(d)}
                  onToggle={() => onChange({ ...value, days: value.days.includes(d) ? value.days.filter((x) => x !== d) : [...value.days, d] })}
                />
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-1">
            <label htmlFor="event-until" className="font-bold">
              {t.until}
            </label>
            <input
              id="event-until"
              type="date"
              min={from}
              max={latestUntil(from)}
              value={value.until}
              onChange={(e) => e.target.value && onChange({ ...value, until: e.target.value })}
              aria-describedby="event-until-help"
              className={field}
            />
            <p id="event-until-help" className="text-caption text-ink-soft">
              {t.untilHelp}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
