// A small calendar of check-ins: one square per day (7 for "This week", 28
// for "Last 4 weeks"), each with up to four dots in the colors of that day's
// states. The dots are decoration; every day has a sentence for screen
// readers ("Tuesday, Nov 3: 2 check-ins, Ebb and Still"), and the legend
// spells out what each color means.
import { copy, fill } from '@/copy/en';
import { QUADRANTS } from '@/lib/quadrant';
import { QUADRANT_STYLES } from '@/lib/quadrantStyles';
import { addDays, formatShortDay, startOfDay, toISODate, weekdayName } from '@/lib/time';
import type { CheckIn } from '@/lib/types';
import { cn } from '@/lib/utils';

function daySentence(ts: number, list: CheckIn[]): string {
  const date = `${weekdayName(ts)}, ${formatShortDay(ts).split(', ')[1]}`;
  if (list.length === 0) return fill(copy.patterns.dayLabelNone, { date });
  const states = [...new Set(list.map((c) => copy.quadrants[c.quadrant].name))];
  const joined = states.length > 1 ? `${states.slice(0, -1).join(', ')} and ${states.at(-1)}` : states[0];
  return fill(list.length === 1 ? copy.patterns.dayLabelOne : copy.patterns.dayLabel, { date, count: list.length, states: joined });
}

export function PeriodDots({ checkins, nowTs, days }: { checkins: CheckIn[]; nowTs: number; days: 7 | 28 }) {
  const first = startOfDay(addDays(nowTs, -(days - 1)));
  const byDay = new Map<string, CheckIn[]>();
  for (const c of checkins.filter((c) => !c.safetyTriggered && c.ts >= first && c.ts <= nowTs).sort((a, b) => a.ts - b.ts)) {
    byDay.set(toISODate(c.ts), [...(byDay.get(toISODate(c.ts)) ?? []), c]);
  }
  const cells = Array.from({ length: days }, (_, i) => addDays(first, i));

  return (
    <section aria-labelledby="calendar-heading" className="flex flex-col gap-3">
      <h2 id="calendar-heading" className="text-h3 font-bold">
        {copy.patterns.calendarTitle}
      </h2>
      <ul aria-label={copy.patterns.calendarLabel} className="grid grid-cols-7 gap-1.5">
        {cells.map((ts) => {
          const list = byDay.get(toISODate(ts)) ?? [];
          return (
            <li key={ts} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md bg-surface p-1">
              <span className="sr-only">{daySentence(ts, list)}</span>
              <span aria-hidden className="text-caption text-ink-soft">
                {new Date(ts).getDate()}
              </span>
              <span aria-hidden className="flex flex-wrap justify-center gap-0.5">
                {list.slice(0, 4).map((c) => (
                  <span key={c.id} className={cn('size-2 rounded-full', QUADRANT_STYLES[c.quadrant].dot)} />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <dl aria-label={copy.patterns.legend} className="grid grid-cols-1 gap-1 text-caption sm:grid-cols-2">
        {QUADRANTS.map((q) => (
          <div key={q} className="flex items-center gap-2">
            <dt className="flex items-center gap-2 font-bold">
              <span aria-hidden className={cn('size-3 rounded-full', QUADRANT_STYLES[q].dot)} />
              {copy.quadrants[q].name}
            </dt>
            <dd className="text-ink-soft">{copy.quadrants[q].subtitle}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
