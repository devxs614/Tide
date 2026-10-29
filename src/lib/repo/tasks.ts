// Every change to a task goes through here, because status changes carry
// side effects: starting stamps startedAt, finishing stamps doneAt and adds a
// win to the proof log. Keeping that in one file means the board, Today, the
// focus page and Day Mode all behave the same way.
import { db } from '../db';
import { now } from '../clock';
import { finishedTaskWin } from '../wins';
import { addWin } from './wins';
import type { StuckReason, Task, TaskStatus, TaskType } from '../types';

export interface NewTask {
  title: string;
  type: TaskType;
  energyCost: 1 | 2 | 3;
  due?: string;
  status?: TaskStatus;
}

async function nextOrder(status: TaskStatus): Promise<number> {
  const inColumn = await db.tasks.where('status').equals(status).toArray();
  return inColumn.reduce((max, t) => Math.max(max, t.order), -1) + 1;
}

export async function addTask(input: NewTask): Promise<Task> {
  const status = input.status ?? 'not_started';
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    type: input.type,
    energyCost: input.energyCost,
    status,
    due: input.due,
    createdAt: now(),
    order: await nextOrder(status),
  };
  if (status === 'in_progress') task.startedAt = task.createdAt;
  await db.tasks.add(task);
  return task;
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

// Moves a task to another column (at the end, unless an index is given) and
// applies the side effects for the new status.
export async function moveTask(id: string, status: TaskStatus, index?: number): Promise<Task | undefined> {
  return db.transaction('rw', db.tasks, db.wins, async () => {
    const task = await db.tasks.get(id);
    if (!task) return undefined;
    const changes: Partial<Task> = { status };
    const t = now();
    if (status === 'in_progress' && !task.startedAt) changes.startedAt = t;
    if (status === 'done' && task.status !== 'done') {
      changes.doneAt = t;
      await addWin(finishedTaskWin(task.title), 'task', task.id);
    }
    // Moving a finished task back clears the stamp but keeps the win:
    // wins never go down.
    if (status !== 'done' && task.status === 'done') changes.doneAt = undefined;

    const column = (await db.tasks.where('status').equals(status).toArray())
      .filter((other) => other.id !== id)
      .sort((a, b) => a.order - b.order);
    const at = index === undefined ? column.length : Math.max(0, Math.min(index, column.length));
    column.splice(at, 0, { ...task, ...changes });
    await Promise.all(column.map((other, i) => db.tasks.update(other.id, { ...(other.id === id ? changes : {}), order: i })));
    return db.tasks.get(id);
  });
}

export async function setStuckReason(id: string, reason: StuckReason): Promise<void> {
  await db.tasks.update(id, { stuckReason: reason });
}

export async function setFirstStep(id: string, step: string): Promise<void> {
  await db.tasks.update(id, { firstStep: step });
}

export async function setParkingNote(id: string, note: string): Promise<void> {
  await db.tasks.update(id, { parkingNote: note.trim() || undefined });
}

export async function updateTask(id: string, changes: Partial<Omit<Task, 'id'>>): Promise<void> {
  await db.tasks.update(id, changes);
}

// Day Mode never deletes: a moved task keeps its place on the board and just
// carries the two dates so Today can list it under "Moved to tomorrow".
export async function markMoved(ids: string[], from: string, to: string): Promise<void> {
  await Promise.all(ids.map((id) => db.tasks.update(id, { movedFrom: from, movedTo: to })));
}

export async function bringBack(id: string): Promise<void> {
  await db.tasks.update(id, { movedFrom: undefined, movedTo: undefined });
}

export async function listTasks(): Promise<Task[]> {
  return db.tasks.toArray();
}
