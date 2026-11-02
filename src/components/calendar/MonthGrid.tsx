'use client';

// The month as a grid (v2.1 F-10, spec 14.3): six weeks of seven days, each
// a button that says what's on it ("Tuesday, November 3: 3 events, 1 task
// due, day closed"). Arrow keys move by day and week, Home and End to the
// week's ends, Page Up and Page Down by month, Enter opens the day. Up to
// three events per day: times and titles when the day is wide enough (a
// container query on the cell, not the screen), dots otherwise.
import { useEffect, useRef } from 'react';
import { CheckSquare, Moon } from 'lucide-react';
import { fill } from '@/copy/en';
import { calendarCopy as t } from '@/copy/calendarCopy';
import type { DaySummary } from '@/lib/calendar/data';
import { shiftDay } from '@/lib/calendar/grid';
import { formatLongDate, formatTime, fromISODate, shortWeekday } from '@/lib/time';
import { cn } from '@/lib/utils';
import { QuadrantDot } from '@/components/ui/QuadrantDot';

interface Props {
  grid: string[];
  month: string; // 'YYYY-MM'
  days: Record<string, DaySummary>;
  weekdays: number[];
  today: string;
  focused: string;
  showCheckins: boolean;
  onFocus: (iso: string) => void;
  onOpen: (iso: string) => void;
  onMonth: (by: number) => void;
  // Set once someone moves with the keys. It lives in the screen, because
  // a new month remounts this grid and the new day must still get focus.
  keyboardRef: { current: boolean };
}

const count = (n: number, words: { one: string; many: string }) => (n === 1 ? words.one : fill(words.many, { n }));

export function dayLabel(iso: string, day: DaySummary | undefined): string {
  const parts = [
    day?.events.length ? count(day.events.length, t.events) : '',
    day?.tasksDue ? count(day.tasksDue, t.tasksDue) : '',
    day?.closed ? t.closed : '',
  ].filter(Boolean);
  return fill(t.dayLabel, { date: formatLongDate(fromISODate(iso)), details: parts.length ? parts.join(', ') : t.nothing });
}

export function MonthGrid({ grid, month, days, weekdays, today, focused, showCheckins, onFocus, onOpen, onMonth, keyboardRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Keyboard focus follows the focused day once someone is moving in the grid.
  useEffect(() => {
    if (keyboardRef.current) ref.current?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)?.focus();
  }, [focused, grid, keyboardRef]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = grid.indexOf(focused);
    const weekStart = index - (index % 7);
    const moves: Record<string, () => string | null> = {
      ArrowLeft: () => shiftDay(focused, -1),
      ArrowRight: () => shiftDay(focused, 1),
      ArrowUp: () => shiftDay(focused, -7),
      ArrowDown: () => shiftDay(focused, 7),
      Home: () => grid[weekStart],
      End: () => grid[weekStart + 6],
      PageUp: () => (onMonth(-1), null),
      PageDown: () => (onMonth(1), null),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    keyboardRef.current = true;
    const next = move();
    if (next) onFocus(next);
  };

  return (
    <div ref={ref} role="grid" aria-label={month} onKeyDown={onKeyDown} className="flex flex-col gap-1">
      <div role="row" className="grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <span key={d} role="columnheader" className="text-center text-caption font-bold text-ink-soft">
            {shortWeekday(new Date(2026, 10, 1 + d).getTime())}
          </span>
        ))}
      </div>
      {Array.from({ length: 6 }, (_, week) => (
        <div key={week} role="row" className="grid grid-cols-7 gap-1">
          {grid.slice(week * 7, week * 7 + 7).map((iso) => {
            const day = days[iso];
            const outside = !iso.startsWith(month);
            const isToday = iso === today;
            const shown = day?.events.slice(0, 3) ?? [];
            return (
              <div key={iso} role="gridcell" className="@container min-w-0">
                <button
                  type="button"
                  data-day={iso}
                  tabIndex={iso === focused ? 0 : -1}
                  aria-label={dayLabel(iso, day)}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => onOpen(iso)}
                  onFocus={() => onFocus(iso)}
                  data-small-target-ok
                  className={cn(
                    'flex min-h-16 w-full flex-col items-stretch gap-0.5 rounded-card border p-1 text-left @min-[7rem]:min-h-24',
                    outside ? 'border-transparent text-ink-soft' : 'border-line bg-surface',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center self-center rounded-full font-bold @min-[7rem]:self-start',
                      isToday && 'bg-primary text-on-primary',
                    )}
                  >
                    {Number(iso.slice(8))}
                  </span>
                  {/* Wide day: time and title, wrapped rather than cut off.
                      Narrow day: a dot per event. */}
                  <span className="hidden min-w-0 flex-col gap-0.5 @min-[7rem]:flex">
                    {shown.map((e) => (
                      <span key={e.id} className="rounded-sm bg-surface-2 px-1 text-caption break-words">
                        {formatTime(e.start)} {e.title}
                      </span>
                    ))}
                  </span>
                  <span className="flex flex-wrap items-center justify-center gap-0.5 @min-[7rem]:hidden">
                    {shown.map((e) => (
                      <span key={e.id} aria-hidden className="size-1.5 rounded-full bg-primary" />
                    ))}
                  </span>
                  {(day?.events.length ?? 0) > 3 && (
                    <span className="text-center text-caption text-ink-soft @min-[7rem]:text-left">{fill(t.more, { n: day!.events.length - 3 })}</span>
                  )}
                  <span className="mt-auto flex flex-wrap items-center justify-center gap-1 @min-[7rem]:justify-start">
                    {day?.tasksDue ? (
                      <span className="inline-flex items-center gap-0.5 text-caption">
                        <CheckSquare aria-hidden className="size-3" />
                        {day.tasksDue}
                      </span>
                    ) : null}
                    {showCheckins && day?.quadrants.slice(0, 3).map((q, i) => <QuadrantDot key={i} quadrant={q} className="size-2" />)}
                    {day?.closed && <Moon aria-hidden className="size-3 text-ink-soft" />}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
