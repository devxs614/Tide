'use client';

// Today, Tide's home screen, top to bottom: greeting, how Maya checked in,
// the lighter-day offer when it applies, what's next, and the Tide Line.
// It redraws every minute so the "Now" marker and countdowns stay current.
import { useState } from 'react';
import { HOUR, startOfDay, toISODate } from '@/lib/time';
import { movedFromToday, shouldShowBanner, todaysTasks } from '@/lib/daymode';
import { useSettings } from '@/lib/settings';
import { useNow } from '@/lib/useNow';
import { TaskForm } from '@/components/tasks/TaskForm';
import { AddEventSheet } from './AddEventSheet';
import { DayModeBanner } from './DayModeBanner';
import { NextTransitionCard } from './NextTransitionCard';
import { StateCard } from './StateCard';
import { TideLine } from './TideLine';
import { TodayHeader } from './TodayHeader';
import { useTodayData } from './useTodayData';

export function TodayScreen() {
  const nowTs = useNow(60_000);
  const today = toISODate(nowTs);
  const dayStart = startOfDay(nowTs);
  const { settings } = useSettings();
  const data = useTodayData(today, dayStart);
  const [addingEvent, setAddingEvent] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  if (!data) return <div className="min-h-dvh" aria-hidden />;

  const banner = shouldShowBanner({ latestToday: data.latest, plan: data.plan, dismissedFor: settings.dayModeBannerDismissedFor });
  const next = data.events.find((e) => e.start > nowTs && e.start - nowTs <= 3 * HOUR);

  return (
    <div className="flex flex-col gap-5">
      <TodayHeader nowTs={nowTs} />
      <StateCard latest={data.latest} />
      {banner && data.latest && <DayModeBanner reason={banner} checkInId={data.latest.id} />}
      {next && <NextTransitionCard event={next} nowTs={nowTs} />}
      <TideLine
        events={data.events}
        tasks={todaysTasks(data.tasks, data.plan, today)}
        moved={movedFromToday(data.tasks, today)}
        nowTs={nowTs}
        today={today}
        quadrant={data.latest?.quadrant ?? null}
        onAddEvent={() => setAddingEvent(true)}
        onAddTask={() => setAddingTask(true)}
      />
      <AddEventSheet open={addingEvent} onOpenChange={setAddingEvent} dayStart={dayStart} />
      <TaskForm open={addingTask} onOpenChange={setAddingTask} />
    </div>
  );
}
