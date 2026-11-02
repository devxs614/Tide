// Which event sheet is open (v2.1 F-04): an event's details, its edit form,
// or the delete question. The same tiny store as taskSheets.ts, so the Tide
// Line (on Today's first load) can open them while AppShell loads the
// sheets' code only when one opens.
import { useSyncExternalStore } from 'react';

export type EventSheet = { kind: 'detail' | 'edit' | 'delete'; id: string } | null;

let current: EventSheet = null;
const listeners = new Set<() => void>();
const set = (next: EventSheet) => {
  current = next;
  listeners.forEach((l) => l());
};

export const openEventDetail = (id: string) => set({ kind: 'detail', id });
export const openEventEdit = (id: string) => set({ kind: 'edit', id });
export const openEventDelete = (id: string) => set({ kind: 'delete', id });
export const closeEventSheet = () => set(null);

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useEventSheet(): EventSheet {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
