// v2.1 F-05: which finished tasks stay on the board (each window, "Clear",
// moving a task back), and the optional 30-day cleanup that removes old
// task entries while their wins stay on the shore.
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { DAY, HOUR } from '@/lib/time';
import { resetApp } from '@/test/utils';
import type { Task } from '@/lib/types';
import { addTask, moveTask } from './tasks';
import { completedTasks, isVisibleInDone } from './taskQueries';
import { clearDoneTasks, runCompletedCleanup, unclearTasks } from './taskEdits';

const NOW = new Date(2026, 10, 5, 15, 40).getTime();
const done = (hoursAgo: number, extra: Partial<Task> = {}): Task =>
  ({ id: 'x', title: 'x', type: 'other', energyCost: 1, status: 'done', order: 0, createdAt: 0, doneAt: NOW - hoursAgo * HOUR, ...extra }) as Task;

beforeEach(async () => {
  await resetApp();
});

describe('isVisibleInDone', () => {
  it('keeps each window, and "forever" keeps everything', () => {
    expect(isVisibleInDone(done(23), NOW, '24h')).toBe(true);
    expect(isVisibleInDone(done(25), NOW, '24h')).toBe(false);
    expect(isVisibleInDone(done(71), NOW, '3d')).toBe(true);
    expect(isVisibleInDone(done(73), NOW, '3d')).toBe(false);
    expect(isVisibleInDone(done(7 * 24 - 1), NOW, '7d')).toBe(true);
    expect(isVisibleInDone(done(7 * 24 + 1), NOW, '7d')).toBe(false);
    expect(isVisibleInDone(done(24 * 400), NOW, 'forever')).toBe(true);
  });

  it('hides cleared, deleted and unfinished tasks', () => {
    expect(isVisibleInDone(done(1, { clearedAt: NOW }), NOW, 'forever')).toBe(false);
    expect(isVisibleInDone(done(1, { deletedAt: NOW }), NOW, 'forever')).toBe(false);
    expect(isVisibleInDone(done(1, { status: 'in_progress' }), NOW, 'forever')).toBe(false);
  });
});

describe('clearing and moving back', () => {
  it('"Clear" hides without deleting, Undo and moving back bring tasks back', async () => {
    const a = await addTask({ title: 'Email TA', type: 'admin', energyCost: 1 });
    const b = await addTask({ title: 'Laundry', type: 'chores', energyCost: 1 });
    await moveTask(a.id, 'done');
    await moveTask(b.id, 'done');
    await clearDoneTasks([a.id, b.id]);
    const at = now();
    expect((await completedTasks()).map((t) => t.id).sort()).toEqual([a.id, b.id].sort());
    expect((await completedTasks()).filter((t) => isVisibleInDone(t, at, 'forever'))).toEqual([]);

    await unclearTasks([a.id]);
    expect(isVisibleInDone((await db.tasks.get(a.id))!, at, 'forever')).toBe(true);
    await moveTask(b.id, 'in_progress');
    const back = (await db.tasks.get(b.id))!;
    expect(back.status).toBe('in_progress');
    expect(back.doneAt).toBeUndefined();
    expect(back.clearedAt).toBeUndefined();
    // Wins never go down: both finished tasks keep their shells.
    expect((await db.wins.toArray()).filter((w) => w.kind === 'task_done')).toHaveLength(2);
  });
});

describe('the 30-day cleanup', () => {
  it('removes finished tasks older than 30 days and keeps their wins', async () => {
    const old = await addTask({ title: 'Old essay', type: 'writing', energyCost: 3 });
    const recent = await addTask({ title: 'Recent quiz', type: 'studying', energyCost: 2 });
    await moveTask(old.id, 'done');
    await moveTask(recent.id, 'done');
    await db.tasks.update(old.id, { doneAt: NOW - 31 * DAY });
    await db.tasks.update(recent.id, { doneAt: NOW - 29 * DAY });
    expect(await runCompletedCleanup(NOW)).toBe(1);
    expect(await db.tasks.get(old.id)).toBeUndefined();
    expect(await db.tasks.get(recent.id)).toBeDefined();
    expect((await db.wins.toArray()).filter((w) => w.refId === old.id)).toHaveLength(1);
  });
});
