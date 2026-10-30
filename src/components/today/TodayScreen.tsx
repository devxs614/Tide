'use client';

// Today, Tide's home screen, top to bottom: greeting, how Maya checked in,
// the lighter-day offer when it applies, what's next, and the Tide Line.
// It redraws every minute so the "Now" marker and countdowns stay current.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HOUR, startOfDay, toISODate } from '@/lib/time';
import { movedFromToday, shouldShowBanner, todaysTasks } from '@/lib/daymode';
import { useSettings } from '@/lib/settings';
import { useNow } from '@/lib/useNow';
import { useBridgeSheet } from '@/lib/ui';
import { BridgeCard } from '@/components/bridge/BridgeCard';
import { TransitionRating } from '@/components/bridge/TransitionRating';
import { eventForTransition } from '@/components/bridge/bridgeDrafts';
import { useUpcomingBridge } from '@/components/bridge/useUpcomingBridge';
import dynamic from 'next/dynamic';
import { WhenOpened } from '@/components/shell/WhenOpened';

// The two forms load when first opened; most visits to Today never open them.
const TaskForm = dynamic(() => import('@/components/tasks/TaskForm').then((m) => m.TaskForm), { ssr: false });
const AddEventSheet = dynamic(() => import('./AddEventSheet').then((m) => m.AddEventSheet), { ssr: false });
import { DayModeBanner } from './DayModeBanner';
import { ChooseCompanionCard } from './ChooseCompanionCard';
import { BottleCard } from './BottleCard';
import { EveningCard } from './EveningCard';
import { MorningCard } from './MorningCard';

import { NextTransitionCard } from './NextTransitionCard';
import { StateCard } from './StateCard';
import { TideLine } from './TideLine';
import { TodayHeader } from './TodayHeader';
import { useTodayData } from './useTodayData';

// The shore strip sits near the bottom of Today and brings the item art;
// loading it after the page keeps Today's first load in budget.
const ShorePreview = dynamic(() => import('./ShorePreview').then((m) => m.ShorePreview), { ssr: false, loading: () => null });

export function TodayScreen({ bridgeRef }: { bridgeRef?: string }) {
  // Every 30 seconds: the bridge countdown needs it, the "Now" marker
  // only changes once a minute anyway.
  const nowTs = useNow(30_000);
  const router = useRouter();
  const bridge = useUpcomingBridge(nowTs);
  const { openBridge } = useBridgeSheet();
  const today = toISODate(nowTs);
  const dayStart = startOfDay(nowTs);
  const { settings } = useSettings();
  const data = useTodayData(today, dayStart);
  const [addingEvent, setAddingEvent] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  // Back from a strategy started in the Bridge (`/?bridge=<id>`): reopen the
  // same switch, then tidy the URL.
  useEffect(() => {
    if (!bridgeRef) return;
    const eventId = eventForTransition(bridgeRef) ?? bridge?.to.id;
    if (!eventId) return;
    openBridge(eventId);
    router.replace('/');
  }, [bridgeRef, bridge, openBridge, router]);

  if (!data) return <div className="min-h-dvh" aria-hidden />;

  const banner = shouldShowBanner({ latestToday: data.latest, plan: data.plan, dismissedFor: settings.dayModeBannerDismissedFor });
  const next = data.events.find((e) => e.start > nowTs && e.start - nowTs <= 3 * HOUR);

  return (
    <div className="flex flex-col gap-5">
      <TodayHeader nowTs={nowTs} />
      <ChooseCompanionCard />
      <StateCard latest={data.latest} />
      <BottleCard />
      <MorningCard nowTs={nowTs} />
      {banner && data.latest && <DayModeBanner reason={banner} checkInId={data.latest.id} />}
      <TransitionRating nowTs={nowTs} />
      {bridge ? <BridgeCard bridge={bridge} /> : next && <NextTransitionCard event={next} nowTs={nowTs} />}
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
      <EveningCard nowTs={nowTs} />
      <ShorePreview />
      <WhenOpened open={addingEvent}>
        <AddEventSheet open={addingEvent} onOpenChange={setAddingEvent} dayStart={dayStart} />
      </WhenOpened>
      <WhenOpened open={addingTask}>
        <TaskForm open={addingTask} onOpenChange={setAddingTask} />
      </WhenOpened>
    </div>
  );
}
