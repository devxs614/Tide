'use client';

// Which sheet is open, shared across the app. The check-in sheet opens from
// the button above the tab bar on every screen, its last step can hand off
// to the Day Mode sheet, and Unstick opens from the board, Today and the
// focus page, so none of them can live inside one page.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { StuckReason } from './types';

export interface UnstickRequest {
  taskId: string;
  // Skip the "what's making it hard?" step: "Break it down for me" already
  // knows the reason, and "Smaller step" from Focus reuses the last one.
  reason?: StuckReason;
  previousStep?: string;
  // Coming back from "Do it first": show the step Maya was already given.
  resume?: boolean;
}

interface UiContextValue {
  checkInOpen: boolean;
  setCheckInOpen: (open: boolean) => void;
  dayModeOpen: boolean;
  setDayModeOpen: (open: boolean) => void;
  unstick: UnstickRequest | null;
  setUnstick: (request: UnstickRequest | null) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [dayModeOpen, setDayModeOpen] = useState(false);
  const [unstick, setUnstick] = useState<UnstickRequest | null>(null);
  const value = useMemo(
    () => ({ checkInOpen, setCheckInOpen, dayModeOpen, setDayModeOpen, unstick, setUnstick }),
    [checkInOpen, dayModeOpen, unstick],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}

export function useCheckInSheet() {
  const { checkInOpen, setCheckInOpen } = useUi();
  const openCheckIn = useCallback(() => setCheckInOpen(true), [setCheckInOpen]);
  const closeCheckIn = useCallback(() => setCheckInOpen(false), [setCheckInOpen]);
  return { open: checkInOpen, openCheckIn, closeCheckIn };
}

// The Day Mode sheet's entry point. The check-in's "Adjust my plan" and
// Today's banner both open it.
export function useDayModeSheet() {
  const { dayModeOpen, setDayModeOpen } = useUi();
  const openDayMode = useCallback(() => setDayModeOpen(true), [setDayModeOpen]);
  const closeDayMode = useCallback(() => setDayModeOpen(false), [setDayModeOpen]);
  return { open: dayModeOpen, openDayMode, closeDayMode };
}

export function useUnstickSheet() {
  const { unstick, setUnstick } = useUi();
  const openUnstick = useCallback((request: UnstickRequest) => setUnstick(request), [setUnstick]);
  const closeUnstick = useCallback(() => setUnstick(null), [setUnstick]);
  return { request: unstick, openUnstick, closeUnstick };
}
