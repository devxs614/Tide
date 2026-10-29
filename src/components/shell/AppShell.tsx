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
import { CheckInSheet } from '@/components/checkin/CheckInSheet';
import { DayModeSheet } from '@/components/today/DayModeSheet';
import { BridgeBanner } from '@/components/bridge/BridgeBanner';
import { BridgeSheet } from '@/components/bridge/BridgeSheet';

function titleFor(pathname: string): string {
  const t = copy.shell.titles;
  if (pathname.startsWith('/tasks')) return t.tasks;
  if (pathname.startsWith('/toolkit/')) return t.strategy;
  if (pathname.startsWith('/toolkit')) return t.toolkit;
  if (pathname.startsWith('/patterns')) return t.patterns;
  if (pathname.startsWith('/proof')) return t.proof;
  if (pathname.startsWith('/settings')) return t.settings;
  if (pathname.startsWith('/support')) return t.support;
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
  if (!loaded || !settings.onboarded) return <PhoneFrame>{null}</PhoneFrame>;

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
      <CheckInSheet />
      <DayModeSheet />
      <BridgeSheet />
    </PhoneFrame>
  );
}
