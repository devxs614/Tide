// The only way screens read tasks (v2.1 spec 7.5). Deleted tasks
// (`deletedAt`) disappear everywhere at once (the board, Today, Day Mode,
// the Bridge, Close the day, the morning card, the Focus picker) because
// every read goes through here; a guard test fails on a direct `db.tasks`
// read outside src/lib/repo/. The pattern engine is the one reader that
// still sees deleted tasks, to know what type a past focus block was.
import { db } from '../db';
import { DAY } from '../time';
import type { Settings, Task, TaskStatus } from '../types';

export const isActiveTask = (t: Task): boolean => !t.deletedAt;

// v2.1 F-05: the Done column shows what was finished recently, so a board
// with three weeks of finished work still looks calm. Older tasks, and ones
// "Clear" moved off the board, rest in the Completed archive.
const DONE_WINDOW = { '24h': DAY, '3d': 3 * DAY, '7d': 7 * DAY } as const;

export function isVisibleInDone(task: Task, at: number, window: Settings['tasks.doneVisibleFor']): boolean {
  if (task.status !== 'done' || task.clearedAt || task.deletedAt) return false;
  return window === 'forever' || (task.doneAt ?? 0) >= at - DONE_WINDOW[window];
}

// Tasks due between two days, inclusive (v2.1 F-10, the calendar).
export function tasksDueBetween(from: string, to: string): Promise<Task[]> {
  return db.tasks
    .where('due')
    .between(from, to, true, true)
    .toArray()
    .then((list) => list.filter(isActiveTask));
}

// Every finished task that wasn't deleted, newest first: the archive.
export function completedTasks(): Promise<Task[]> {
  return tasksByStatus(['done']).then((list) => list.sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0)));
}

// Plain queries, filtered afterwards. Dexie updates a live query on a plain
// query the moment a write happens in this tab; a query with a JavaScript
// filter() has to wait for the commit and run again, and the board lagged
// behind a move (a v1 flow test caught it).
export function activeTasks(): Promise<Task[]> {
  return db.tasks.toArray().then((list) => list.filter(isActiveTask));
}

export function tasksByStatus(statuses: TaskStatus[]): Promise<Task[]> {
  return db.tasks.where('status').anyOf(statuses).toArray().then((list) => list.filter(isActiveTask));
}

export function getTask(id: string, opts: { includeDeleted?: boolean } = {}): Promise<Task | undefined> {
  return db.tasks.get(id).then((task) => (task && (opts.includeDeleted || isActiveTask(task)) ? task : undefined));
}

// For the pattern engine only: everything, deleted or not.
export async function allTasksForPatterns(): Promise<Task[]> {
  return db.tasks.toArray();
}

export async function countTasksWithFirstStep(): Promise<number> {
  return db.tasks.filter((t) => isActiveTask(t) && !!t.firstStep).count();
}

export async function countDeletedTasks(): Promise<number> {
  return db.tasks.filter((t) => !!t.deletedAt).count();
}
