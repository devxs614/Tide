// Editing and deleting tasks (v2.1 F-03). A plain delete is soft: the task
// gets `deletedAt` and vanishes from every screen, while its focus blocks,
// strategy history and wins stay, so the shore keeps its shells and the
// patterns keep learning. "Also remove its history" waits out the 10-second
// Undo, then removes the task and what hangs off it in one transaction.
// If the app closes inside that window, the removal runs at the next start.
import { db } from '../db';
import { now } from '../clock';
import type { DayPlan, DayWrap, Task, TaskType } from '../types';

export const UNDO_MS = 10_000;

export interface TaskEdit {
  title: string;
  type: TaskType;
  energyCost: 1 | 2 | 3;
  due?: string;
  firstStep?: string;
}

// Changing the type or energy never rewrites past focus blocks or wins.
export async function editTask(id: string, edit: TaskEdit): Promise<void> {
  const title = edit.title.trim();
  if (!title || title.length > 120) throw new Error('A task title needs 1 to 120 characters.');
  const firstStep = edit.firstStep?.trim();
  await db.tasks.update(id, {
    title,
    type: edit.type,
    energyCost: edit.energyCost,
    due: edit.due,
    firstStep: firstStep || undefined,
    updatedAt: now(),
  });
}

export async function softDeleteTask(id: string, opts: { withHistory?: boolean } = {}): Promise<void> {
  await db.tasks.update(id, { deletedAt: now(), purgeRequested: opts.withHistory || undefined, updatedAt: now() });
}

export async function softDeleteTasks(ids: string[], opts: { withHistory?: boolean } = {}): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    for (const id of ids) await softDeleteTask(id, opts);
  });
}

export async function undoDeleteTasks(ids: string[]): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    for (const id of ids) await db.tasks.update(id, { deletedAt: undefined, purgeRequested: undefined });
  });
}

// The task and its history, gone: focus blocks deleted, strategy uses and
// transitions unlinked (they're about the strategy and the switch, not the
// task), wins deleted (their shells leave the shore), and the id taken out
// of day plans and wrap-ups. Nothing else is touched.
export async function purgeTaskCascade(id: string): Promise<void> {
  await db.transaction('rw', [db.tasks, db.focusBlocks, db.strategyUses, db.transitions, db.wins, db.dayPlans, db.dayWraps], async () => {
    await db.tasks.delete(id);
    await db.focusBlocks.where('taskId').equals(id).delete();
    await db.strategyUses.filter((u) => u.taskId === id).modify((u) => void delete u.taskId);
    await db.transitions.filter((t) => t.fromTaskId === id).modify((t) => void delete t.fromTaskId);
    await db.wins.filter((w) => w.refId === id).delete();
    await db.dayPlans.toCollection().modify((p: DayPlan) => {
      p.keptTaskIds = p.keptTaskIds.filter((t) => t !== id);
      p.movedTaskIds = p.movedTaskIds.filter((t) => t !== id);
    });
    await db.dayWraps.toCollection().modify((w: DayWrap) => {
      w.carryover = w.carryover.filter((c) => c.taskId !== id);
      if (w.anchorTaskId === id) delete w.anchorTaskId;
    });
  });
}

// Just the task row (history kept), for "Permanently remove deleted tasks"
// with the box unchecked and the 30-day cleanup.
export async function removeTaskRow(id: string): Promise<void> {
  await db.tasks.delete(id);
}

// At start-up: finish any "remove its history" whose Undo window passed
// while the app was closed.
export async function runPendingPurges(at = now()): Promise<number> {
  const due = await db.tasks.filter((t: Task) => !!t.purgeRequested && !!t.deletedAt && at - t.deletedAt >= UNDO_MS).toArray();
  for (const t of due) await purgeTaskCascade(t.id);
  return due.length;
}

// Settings → Privacy & data → "Permanently remove deleted tasks".
export async function purgeAllDeletedTasks(opts: { withHistory: boolean }): Promise<number> {
  const deleted = await db.tasks.filter((t) => !!t.deletedAt).toArray();
  for (const t of deleted) await (opts.withHistory ? purgeTaskCascade(t.id) : removeTaskRow(t.id));
  return deleted.length;
}
