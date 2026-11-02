'use client';

// Any day (v2.1 F-10, /calendar/[date]): the long date, previous and next
// day, Today, and back to the month, then either what's ahead (a future
// day) or a look back (a past day). Today itself goes to Today's Tide
// Line, which stays the heart of the app (D182).
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarCopy as t } from '@/copy/calendarCopy';
import { now } from '@/lib/clock';
import { loadDay } from '@/lib/calendar/data';
import { shiftDay } from '@/lib/calendar/grid';
import { formatLongDate, fromISODate, toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { DayAhead } from './DayAhead';
import { DayPast } from './DayPast';

export function CalendarDayScreen({ date }: { date: string }) {
  const router = useRouter();
  const today = toISODate(now());
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const day = useLiveQuery(() => (valid ? loadDay(date) : Promise.resolve(null)), [date, valid]);
  useEffect(() => {
    if (date === today || !valid) router.replace('/');
  }, [date, today, valid, router]);

  // Swipe between days on touch; the buttons do the same for everyone.
  const swipe = useRef<number | null>(null);
  const go = (by: number) => {
    const next = shiftDay(date, by);
    router.push(next === today ? '/' : `/calendar/${next}`);
  };

  if (!valid || date === today) return null;
  if (!day) return <ScreenSkeleton rows={3} rowClassName="h-24" />;
  return (
    <div
      className="flex flex-col gap-4"
      onPointerDown={(e) => e.pointerType === 'touch' && (swipe.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipe.current === null) return;
        const dx = e.clientX - swipe.current;
        swipe.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <Button variant="quiet" size="sm" className="self-start" asChild>
        <Link href="/calendar" data-nav="back" data-demo-id="calendar-back">
          <ArrowLeft aria-hidden />
          {t.backToMonth}
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 flex-1 basis-48 text-h1 font-extrabold">{formatLongDate(fromISODate(date))}</h2>
        <Button variant="secondary" size="sm" onClick={() => go(-1)}>
          <ChevronLeft aria-hidden />
          {t.prevDay}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => go(1)}>
          {t.nextDay}
          <ChevronRight aria-hidden />
        </Button>
        <Button variant="quiet" size="sm" onClick={() => router.push('/')}>
          {t.goToToday}
        </Button>
      </div>
      {date > today ? <DayAhead date={date} day={day} /> : <DayPast day={day} />}
    </div>
  );
}
