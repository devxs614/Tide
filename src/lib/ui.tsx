'use client';

// Which sheet is open, shared across the app. The check-in sheet opens from
// the button above the tab bar on every screen, and its last step can hand
// off to the Day Mode sheet, so neither can live inside one page.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface UiContextValue {
  checkInOpen: boolean;
  setCheckInOpen: (open: boolean) => void;
  dayModeOpen: boolean;
  setDayModeOpen: (open: boolean) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [dayModeOpen, setDayModeOpen] = useState(false);
  const value = useMemo(
    () => ({ checkInOpen, setCheckInOpen, dayModeOpen, setDayModeOpen }),
    [checkInOpen, dayModeOpen],
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
