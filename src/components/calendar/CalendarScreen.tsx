'use client';

// The month view (v2.1 F-10, /calendar): what's coming at a glance, around
// the daily Tide Line rather than instead of it. Previous, next and Today
// buttons, a swipe on touch, a grid with full keyboard support, and a list
// for large text (or by choice). Tapping a day opens its day view.
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarCopy as t } from '@/copy/calendarCopy';
import { now } from '@/lib/clock';
import { loadMonth } from '@/lib/calendar/data';
import { monthGrid, monthKey, monthOf, shiftMonth, weekdayOrder } from '@/lib/calendar/grid';
import { useSettings } from '@/lib/settings';
import { MONTHS, toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AgendaList } from './AgendaList';
import { MonthGrid } from './MonthGrid';

export function CalendarScreen() {
  const router = useRouter();
  const { settings, update } = useSettings();
  const today = toISODate(now());
  const [shown, setShown] = useState(() => monthOf(today));
  const [focused, setFocused] = useState(today);
  const grid = useMemo(() => monthGrid(shown.year, shown.month, settings['language.weekStart']), [shown, settings]);
  const key = monthKey(shown.year, shown.month);
  const days = useLiveQuery(() => loadMonth(grid[0], grid[41]), [grid]) ?? {};
  // Seven columns can't hold text at 130% and up: a list instead, unless
  // the person chose otherwise.
  const layout = settings['calendar.layout'];
  const view = layout === 'auto' ? (settings.textScale >= 1.3 ? 'list' : 'grid') : layout;

  const keyboardRef = useRef(false);
  const goMonth = (by: number) => {
    const next = shiftMonth(shown.year, shown.month, by);
    setShown(next);
    setFocused(`${monthKey(next.year, next.month)}-01`);
  };
  const focusDay = (iso: string) => {
    setFocused(iso);
    if (!grid.includes(iso)) setShown(monthOf(iso));
  };
  const open = (iso: string) => router.push(iso === today ? '/' : `/calendar/${iso}`);

  // A horizontal swipe changes the month; the buttons are the accessible way.
  const swipe = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') swipe.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 60) goMonth(dx < 0 ? 1 : -1);
  };

  return (
    <div className="flex flex-col gap-4" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <div className="flex flex-wrap items-center gap-2">
        {/* The top bar holds the page's h1 ("Calendar"), as on every screen. */}
        <h2 className="min-w-0 flex-1 basis-48 text-h1 font-extrabold" aria-live="polite">
          {MONTHS[shown.month]} {shown.year}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => goMonth(-1)} data-demo-id="calendar-prev">
          <ChevronLeft aria-hidden />
          {t.prevMonth}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => goMonth(1)} data-demo-id="calendar-next">
          {t.nextMonth}
          <ChevronRight aria-hidden />
        </Button>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => {
            setShown(monthOf(today));
            setFocused(today);
          }}
        >
          {t.today}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label={t.viewLabel}
          value={view}
          onChange={(v) => void update('calendar.layout', v as 'grid' | 'list')}
          options={[
            { value: 'grid', label: t.grid },
            { value: 'list', label: t.list },
          ]}
        />
        <Button variant="link" size="inline" onClick={() => open(focused)}>
          {t.day}
        </Button>
      </div>
      {/* Keyed by month, so each month arrives with the app's entrance. */}
      <div key={key} className="page-enter">
        {view === 'grid' ? (
          <MonthGrid
            grid={grid}
            month={key}
            days={days}
            weekdays={weekdayOrder(settings['language.weekStart'])}
            today={today}
            focused={focused}
            showCheckins={settings['calendar.showCheckins']}
            onFocus={focusDay}
            onOpen={open}
            onMonth={goMonth}
            keyboardRef={keyboardRef}
          />
        ) : (
          <AgendaList dates={grid.filter((d) => d.startsWith(key))} days={days} today={today} onOpen={open} />
        )}
      </div>
    </div>
  );
}
