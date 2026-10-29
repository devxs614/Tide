'use client';

// Which sheet is open, shared across the app. The check-in sheet opens from
// the button above the tab bar on every screen, so its open state can't live
// inside one page. Later phases add the Day Mode and Unstick sheets here too.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface UiContextValue {
  checkInOpen: boolean;
  openCheckIn: () => void;
  closeCheckIn: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const openCheckIn = useCallback(() => setCheckInOpen(true), []);
  const closeCheckIn = useCallback(() => setCheckInOpen(false), []);

  const value = useMemo(
    () => ({ checkInOpen, openCheckIn, closeCheckIn }),
    [checkInOpen, openCheckIn, closeCheckIn],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}

export function useCheckInSheet() {
  const { checkInOpen, openCheckIn, closeCheckIn } = useUi();
  return { open: checkInOpen, openCheckIn, closeCheckIn };
}
