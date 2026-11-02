// Editing and deleting tasks (v2.1 F-03): a soft delete hides the task from
// every read, Undo brings it back, the history purge removes the right
// records and nothing else, and pending purges finish at start-up.
import { describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { resetApp } from '@/test/utils';
import { addTask } from './tasks';
import { activeTasks, getTask } from './taskQueries';
import { editTask, purgeTaskCascade, runPendingPurges, softDeleteTasks, undoDeleteTasks, UNDO_MS } from './taskEdits';

describe('task edits', () => {
  it('edits in place', async () => {
    await resetApp();
    const t = await addTask({ title: 'Reply to group project chat', type: 'social', energyCost: 1 });
    await editTask(t.id, { title: ' Reply to group chat about slides ', type: 'social', energyCost: 2, firstStep: 'Open the chat' });
    expect(await getTask(t.id)).toMatchObject({ title: 'Reply to group chat about slides', energyCost: 2, firstStep: 'Open the chat' });
  });

  it('hides a deleted task everywhere and Undo restores it', async () => {
    await resetApp();
    const t = await addTask({ title: 'Laundry', type: 'chores', energyCost: 1 });
    await softDeleteTasks([t.id]);
    expect(await getTask(t.id)).toBeUndefined();
    expect(await activeTasks()).toEqual([]);
    expect(await getTask(t.id, { includeDeleted: true })).toBeDefined();
    await undoDeleteTasks([t.id]);
    expect((await activeTasks()).map((x) => x.id)).toEqual([t.id]);
  });

  it('removes history only for that task, and finishes pending purges at start-up', async () => {
    await resetApp();
    const a = await addTask({ title: 'Essay', type: 'writing', energyCost: 3 });
    const b = await addTask({ title: 'Lab', type: 'studying', energyCost: 2 });
    await db.focusBlocks.bulkAdd([
      { id: 'f1', taskId: a.id, ts: 1, minutes: 10, completed: true },
      { id: 'f2', taskId: b.id, ts: 2, minutes: 10, completed: true },
    ]);
    await db.wins.bulkAdd([
      { id: 'w1', ts: 1, text: 'Finished: Essay', source: 'task', refId: a.id, kind: 'task_done' },
      { id: 'w2', ts: 2, text: 'Finished: Lab', source: 'task', refId: b.id, kind: 'task_done' },
    ]);
    await db.strategyUses.add({ id: 's1', strategyId: 'c-box', ts: 1, context: 'unstick', taskId: a.id });
    await purgeTaskCascade(a.id);
    expect(await db.tasks.get(a.id)).toBeUndefined();
    expect((await db.focusBlocks.toArray()).map((f) => f.id)).toEqual(['f2']);
    expect((await db.wins.toArray()).map((w) => w.id)).toEqual(['w2']);
    expect((await db.strategyUses.get('s1'))?.taskId).toBeUndefined();

    await softDeleteTasks([b.id], { withHistory: true });
    expect(await runPendingPurges((await db.tasks.get(b.id))!.deletedAt! + UNDO_MS - 1)).toBe(0);
    expect(await runPendingPurges((await db.tasks.get(b.id))!.deletedAt! + UNDO_MS)).toBe(1);
    expect(await db.tasks.get(b.id)).toBeUndefined();
  });
});
