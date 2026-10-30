'use client';

// Client-side providers shared by every page: settings (and the demo clock
// that hangs off them), which sheet is open, the Unstick sheet that can open
// from anywhere, the calm toast area, and the one place celebrations play.
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { SettingsProvider } from '@/lib/settings';
import { UiProvider, useUnstickSheet } from '@/lib/ui';
import { Toaster } from '@/components/ui/sonner';
import { WhenOpened } from '@/components/shell/WhenOpened';
import { CelebrationHost } from '@/components/celebrate/CelebrationHost';
import { DemoHost } from '@/demo/DemoHost';

const UnstickSheet = dynamic(() => import('@/components/tasks/UnstickSheet').then((m) => m.UnstickSheet), { ssr: false });

// Unstick opens from the board, Today and the focus page, which sits outside
// the tab layout, so it lives up here. Its code loads on first use.
function GlobalSheets() {
  const { request } = useUnstickSheet();
  return (
    <WhenOpened open={!!request}>
      <UnstickSheet />
    </WhenOpened>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <UiProvider>
        {children}
        <GlobalSheets />
      </UiProvider>
      <Toaster />
      <CelebrationHost />
      <DemoHost />
    </SettingsProvider>
  );
}
