// Whether Quick check-in is open (v2.3 Item 1): a two-tap check-in for
// moments when typing feels like too much. A tiny store outside React, so
// the check-in button, the `q` key and Today's state card can all open it
// without loading the sheet itself until it's needed.
import { useSyncExternalStore } from 'react';

let open = false;
const listeners = new Set<() => void>();
const set = (next: boolean) => {
  open = next;
  listeners.forEach((l) => l());
};

export const openQuickCheckIn = () => set(true);
export const closeQuickCheckIn = () => set(false);

export const useQuickCheckInOpen = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false,
  );
