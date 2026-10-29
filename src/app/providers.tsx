'use client';

// Client-side providers shared by every page: settings (and the demo clock
// that hangs off them), the sheets that can open from anywhere, motion
// preferences for framer-motion, tooltips and the calm toast area.
import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { SettingsProvider, useReducedMotionPref } from '@/lib/settings';
import { UiProvider } from '@/lib/ui';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { UnstickSheet } from '@/components/tasks/UnstickSheet';

function MotionPreference({ children }: { children: ReactNode }) {
  const reduce = useReducedMotionPref();
  return <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>{children}</MotionConfig>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <MotionPreference>
        <TooltipProvider>
          <UiProvider>
            {children}
            {/* Unstick opens from the board, Today and the focus page, which
                sits outside the tab layout, so it lives up here. */}
            <UnstickSheet />
          </UiProvider>
          <Toaster />
        </TooltipProvider>
      </MotionPreference>
    </SettingsProvider>
  );
}
