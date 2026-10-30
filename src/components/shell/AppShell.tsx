'use client';

// The frame around every tab screen: top bar, the scrolling content, then the
// Check in button and the tab bar pinned to the bottom. The DOM order is the
// keyboard order the spec asks for: top bar, content, Check in, tabs.
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '@/lib/settings';
import { copy } from '@/copy/en';
import { cn } from '@/lib/utils';
import { PhoneFrame } from './PhoneFrame';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { CheckInFab } from './CheckInFab';
import { Splash } from './Splash';
import dynamic from 'next/dynamic';
import { useBridgeSheet, useCheckInSheet, useDayModeSheet } from '@/lib/ui';
import { BridgeBanner } from '@/components/bridge/BridgeBanner';
import { WhenOpened } from './WhenOpened';

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
const BridgeSheet = dynamic(
  () => import('@/components/bridge/BridgeSheet').then((m) => m.BridgeSheet),
  { ssr: false },
);

function Sheets() {
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
  return t.today;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loaded } = useSettings();
  const wide = pathname.startsWith('/tasks');

  // First visit goes to onboarding. Nothing renders until settings have
  // loaded, so the demo clock and preferences are right on the first paint.
  useEffect(() => {
    if (loaded && !settings.onboarded) router.replace('/onboarding');
  }, [loaded, settings.onboarded, router]);
  if (!loaded) return <PhoneFrame><Splash /></PhoneFrame>;
  if (!settings.onboarded) return <PhoneFrame>{null}</PhoneFrame>;

  return (
    <PhoneFrame wide={wide}>
      <a
        href="#main"
        className="sr-only-focusable absolute left-2 top-2 z-50 rounded-full bg-primary px-4 py-2 text-on-primary"
      >
        {copy.global.skipToContent}
      </a>
      <TopBar title={titleFor(pathname)} />
      <BridgeBanner />
      <main id="main" tabIndex={-1} className="flex-1 px-5 pb-48 pt-5 outline-none">
        {children}
      </main>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px]',
          wide && 'lg:max-w-[1100px]',
        )}
      >
        <CheckInFab />
        <TabBar />
      </div>
      <Sheets />
    </PhoneFrame>
  );
}
