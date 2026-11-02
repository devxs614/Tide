// Flow tests for v2.1 F-03 (spec 7.8): edit a task from the board and see
// the change on Today; delete with Undo; delete with its history, and after
// the 10-second window its shell has left the shore. Also: a task deleted
// while its focus block runs ends the block without the outcome question.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { toISODate } from '@/lib/time';
import { addTask, moveTask } from '@/lib/repo/tasks';
import { softDeleteTasks, UNDO_MS } from '@/lib/repo/taskEdits';
import { AppShell } from '@/components/shell/AppShell';
import { TodayScreen } from '@/components/today/TodayScreen';
import { ShoreScreen } from '@/components/shore/ShoreScreen';
import { FocusScreen } from '@/components/focus/FocusScreen';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { TasksScreen } from './TasksScreen';

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.useRealTimers());

async function openDetails(user: Awaited<ReturnType<typeof renderApp>>['user'], column: RegExp, title: string) {
  await user.click(await screen.findByRole('button', { name: column }));
  await user.click(await screen.findByRole('button', { name: title }));
  return screen.findByRole('dialog', { name: title });
}

describe('editing and deleting tasks', () => {
  it('edits a task from the board, and Today shows the new title', async () => {
    const task = await addTask({ title: 'Reply to group project chat', type: 'social', energyCost: 1, due: toISODate(now()) });
    navigation.pathname = '/tasks';
    const { user } = await renderApp(
      <AppShell>
        <TasksScreen />
      </AppShell>,
    );
    const details = await openDetails(user, /^Not started/, 'Reply to group project chat');
    await user.click(within(details).getByRole('button', { name: 'Edit' }));
    const form = await screen.findByRole('dialog', { name: 'Edit task' });
    const title = within(form).getByLabelText('Task');
    await user.clear(title);
    await user.type(title, 'Reply to group chat about slides');
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    await waitFor(async () => expect((await db.tasks.get(task.id))?.title).toBe('Reply to group chat about slides'));

    cleanup();
    navigation.pathname = '/';
    await renderApp(
      <AppShell>
        <TodayScreen />
      </AppShell>,
    );
    expect(await screen.findByRole('button', { name: 'Reply to group chat about slides' })).toBeInTheDocument();
  });

  it('asks before an edit can save an empty title', async () => {
    await addTask({ title: 'Laundry', type: 'chores', energyCost: 1 });
    navigation.pathname = '/tasks';
    const { user } = await renderApp(
      <AppShell>
        <TasksScreen />
      </AppShell>,
    );
    const details = await openDetails(user, /^Not started/, 'Laundry');
    await user.click(within(details).getByRole('button', { name: 'Edit' }));
    const form = await screen.findByRole('dialog', { name: 'Edit task' });
    await user.clear(within(form).getByLabelText('Task'));
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    expect(await within(form).findByText('Add a few words so you can recognize it.')).toBeInTheDocument();
  });

  it('deletes a task and Undo brings it back', async () => {
    const task = await addTask({ title: 'Laundry', type: 'chores', energyCost: 1 });
    navigation.pathname = '/tasks';
    const { user } = await renderApp(
      <AppShell>
        <TasksScreen />
      </AppShell>,
    );
    const details = await openDetails(user, /^Not started/, 'Laundry');
    await user.click(within(details).getByRole('button', { name: 'Delete' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete "Laundry"?' });
    expect(within(confirm).getByRole('checkbox', { name: /Also remove what washed up/ })).not.toBeChecked();
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    await waitFor(async () => expect((await db.tasks.get(task.id))?.deletedAt).toBeDefined());
    expect(await screen.findByRole('button', { name: /^Not started \(0\)/ })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(async () => expect((await db.tasks.get(task.id))?.deletedAt).toBeUndefined());
    expect(await screen.findByRole('button', { name: 'Laundry' })).toBeInTheDocument();
  });

  it('deletes a task with its history, and after the window its shell leaves the shore', async () => {
    // Only the timers the purge waits on are faked, and they still run in
    // real time, so IndexedDB and the sheets behave as usual.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    const task = await addTask({ title: 'Email TA', type: 'admin', energyCost: 1 });
    await moveTask(task.id, 'done');
    navigation.pathname = '/tasks';
    const { user } = await renderApp(
      <AppShell>
        <TasksScreen />
      </AppShell>,
    );
    const details = await openDetails(user, /^Done/, 'Email TA');
    await user.click(within(details).getByRole('button', { name: 'Delete' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete "Email TA"?' });
    await user.click(within(confirm).getByRole('checkbox', { name: /Also remove what washed up/ }));
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    await waitFor(async () => expect((await db.tasks.get(task.id))?.purgeRequested).toBe(true));
    expect((await db.wins.toArray()).filter((w) => w.refId === task.id)).toHaveLength(1);

    vi.advanceTimersByTime(UNDO_MS);
    await waitFor(async () => expect(await db.tasks.get(task.id)).toBeUndefined());
    expect((await db.wins.toArray()).filter((w) => w.refId === task.id)).toHaveLength(0);

    cleanup();
    await renderApp(<ShoreScreen />);
    expect(await screen.findByText(/Your shore is quiet for now/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Cowrie,/ })).not.toBeInTheDocument();
  });

  it('ends a running focus block quietly when its task is deleted', async () => {
    const task = await addTask({ title: 'Lab report', type: 'writing', energyCost: 2 });
    navigation.pathname = `/focus/${task.id}`;
    const { user } = await renderApp(<FocusScreen taskId={task.id} suggestedMinutes={5} />);
    await user.click(await screen.findByRole('button', { name: 'Start' }));
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(localStorage.getItem('tide.focusRunning')).toContain(task.id);

    await softDeleteTasks([task.id]);
    expect(await screen.findByText('This task is no longer on your list.')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('tide.focusRunning')).toBeNull());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
