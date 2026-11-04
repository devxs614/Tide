'use client';

// The frame around every tab screen: top bar, the scrolling content, then the
// Check in button and the tab bar pinned to the bottom. The DOM order is the
// keyboard order the spec asks for: top bar, content, Check in, tabs.
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '@/lib/settings';
import { currentWorkspace } from '@/lib/workspace';
import { copy } from '@/copy/en';
import { PhoneFrame } from './PhoneFrame';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { CheckInFab } from './CheckInFab';
import { Splash } from './Splash';
import dynamic from 'next/dynamic';
import { useBridgeSheet, useCheckInSheet, useDayModeSheet } from '@/lib/ui';
import { useTaskSheet } from '@/lib/taskSheets';
import { useEventSheet } from '@/lib/eventSheets';
import { DAY } from '@/lib/time';
import { useAmbienceState } from '@/lib/sound/ambienceState';
import { BridgeBanner } from '@/components/bridge/BridgeBanner';
import { WhenOpened } from './WhenOpened';
import { OfflinePill } from './OfflinePill';

// The sheets load the first time they open, so a screen's first load
// doesn't carry the check-in steps, the AI validation and the Bridge.
const CheckInSheet = dynamic(
  () => import('@/components/checkin/CheckInSheet').then((m) => m.CheckInSheet),
  { ssr: false },
);
const DayModeSheet = dynamic(
  () => import('@/components/today/DayModeSheet').then((m) => m.DayModeSheet),
  { ssr: false },
);
// Task details, edit and delete (v2.1 F-03) load the first time one opens.
const TaskSheets = dynamic(() => import('@/components/tasks/TaskSheets').then((m) => m.TaskSheets), { ssr: false });
// The same for an event's details, edit and delete (v2.1 F-04).
const EventSheets = dynamic(() => import('@/components/events/EventSheets').then((m) => m.EventSheets), { ssr: false });
// The background-sound mini player (v2.1 F-09) loads once a sound is on.
const AmbienceMini = dynamic(() => import('@/components/ambience/AmbienceMini').then((m) => m.AmbienceMini), { ssr: false });
// Keyboard shortcuts only matter once someone presses a key, so their code
// loads right after the page instead of with it (`/` sits at its budget).
const KeyboardShortcuts = dynamic(() => import('./KeyboardShortcuts').then((m) => m.KeyboardShortcuts), { ssr: false });
// v1 users meet v2 here, once (spec 11.3). Loaded only for them.
const WhatsNewSheet = dynamic(() => import('@/components/whatsnew/WhatsNewSheet').then((m) => m.WhatsNewSheet), { ssr: false });
const BridgeSheet = dynamic(
  () => import('@/components/bridge/BridgeSheet').then((m) => m.BridgeSheet),
  { ssr: false },
);

function Sheets() {
  const taskSheet = useTaskSheet();
  const eventSheet = useEventSheet();
  const checkIn = useCheckInSheet();
  const dayMode = useDayModeSheet();
  const bridge = useBridgeSheet();
  return (
    <>
      <WhenOpened open={checkIn.open}>
        <CheckInSheet />
      </WhenOpened>
      <WhenOpened open={dayMode.open}>
        <DayModeSheet />
      </WhenOpened>
      <WhenOpened open={!!bridge.eventId}>
        <BridgeSheet />
      </WhenOpened>
      <WhenOpened open={!!taskSheet}>
        <TaskSheets />
      </WhenOpened>
      <WhenOpened open={!!eventSheet}>
        <EventSheets />
      </WhenOpened>
    </>
  );
}

function titleFor(pathname: string): string {
  const t = copy.shell.titles;
  if (pathname.startsWith('/tasks')) return t.tasks;
  if (pathname.startsWith('/toolkit/')) return t.strategy;
  if (pathname.startsWith('/toolkit')) return t.toolkit;
  if (pathname.startsWith('/patterns')) return t.patterns;
  if (pathname.startsWith('/proof')) return t.proof;
  if (pathname.startsWith('/settings')) return t.settings;
  if (pathname.startsWith('/support')) return t.support;
  if (pathname.startsWith('/shore')) return t.shore;
  if (pathname.startsWith('/calendar')) return t.calendar;
  return t.today;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loaded } = useSettings();
  const ambience = useAmbienceState();

  // First visit goes to onboarding. Nothing renders until settings have
  // loaded, so the demo clock and preferences are right on the first paint.
  // The demo workspace is never sent there: on its first open the database
  // is still being seeded (which marks onboarding done), and leaving the
  // page would lose the ?demo=start that tells the tour to begin.
  const inDemo = currentWorkspace() === 'demo';
  useEffect(() => {
    if (loaded && !settings.onboarded && !inDemo) router.replace('/onboarding');
  }, [loaded, settings.onboarded, inDemo, router]);
  // A "remove its history" whose Undo window ran out while Tide was closed
  // finishes now (v2.1 F-03). Loaded on its own so `/` stays light.
  useEffect(() => {
    if (loaded) void import('@/lib/repo/taskEdits').then((m) => m.runPendingPurges());
  }, [loaded]);
  // "Remove finished tasks after 30 days" (v2.1 F-05, off by default): at
  // start-up and once a day while Tide stays open.
  const cleanup = settings['tasks.autoDeleteCompletedAfter'];
  useEffect(() => {
    if (!loaded || cleanup !== '30d') return;
    const run = () => void import('@/lib/repo/taskEdits').then((m) => m.runCompletedCleanup());
    run();
    const id = window.setInterval(run, DAY);
    return () => window.clearInterval(id);
  }, [loaded, cleanup]);
  if (!loaded || (!settings.onboarded && inDemo)) return <PhoneFrame><Splash /></PhoneFrame>;
  if (!settings.onboarded) return <PhoneFrame>{null}</PhoneFrame>;
  // Someone who finished v1 onboarding and hasn't met the companions yet.
  // Never during the demo, which runs its own scripted tour.
  // Focus and the Toolkit have the full player on screen.
  const showMiniPlayer = !!ambience.sound && !pathname.startsWith('/focus') && !pathname.startsWith('/toolkit');
  const showWhatsNew = !settings.demoMode && settings['companion.species'] === null && !settings['whatsNew.seen'];

  return (
    <PhoneFrame>
      <a
        href="#main"
        className="sr-only-focusable absolute left-2 top-2 z-(--z-popover) rounded-full bg-primary px-4 py-2 text-on-primary"
      >
        {copy.global.skipToContent}
      </a>
      <TopBar title={titleFor(pathname)} />
      <OfflinePill />
      <BridgeBanner />
      {/* `isolate`: the page gets its own stacking context, so a z-index
          inside it (a segmented control's thumb) can never paint over the
          sticky top bar or the tab bar (v2.1 F-02). */}
      <main id="main" tabIndex={-1} className="isolate flex-1 px-5 pb-48 pt-5 outline-none">
        {children}
      </main>
      <div
        data-overlay="chrome"
        className="fixed inset-x-0 bottom-0 z-(--z-tabbar) mx-auto w-full max-w-[430px]"
      >
        {showMiniPlayer && <AmbienceMini />}
        <CheckInFab />
        <TabBar />
      </div>
      <Sheets />
      <KeyboardShortcuts />
      {showWhatsNew && <WhatsNewSheet />}
    </PhoneFrame>
  );
}
