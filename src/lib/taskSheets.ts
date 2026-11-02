// Which task sheet is open (v2.1 F-03): a task's details, its edit form, or
// the delete question for one or more tasks. A tiny store instead of React
// context, so a task card (on Today's first load) can open them without
// pulling the sheets' code in; AppShell loads the sheets when one opens.
import { useSyncExternalStore } from 'react';

export type TaskSheet = { kind: 'detail'; id: string } | { kind: 'edit'; id: string } | { kind: 'delete'; ids: string[] } | null;

let current: TaskSheet = null;
const listeners = new Set<() => void>();
const set = (next: TaskSheet) => {
  current = next;
  listeners.forEach((l) => l());
};

export const openTaskDetail = (id: string) => set({ kind: 'detail', id });
export const openTaskEdit = (id: string) => set({ kind: 'edit', id });
export const openTaskDelete = (ids: string[]) => set({ kind: 'delete', ids });
export const closeTaskSheet = () => set(null);

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTaskSheet(): TaskSheet {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
