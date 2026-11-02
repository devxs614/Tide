// Flow tests for v2.1 F-05 (spec 9.5): with the demo seed the Done column
// shows only the last day's tasks and links to the rest; "Clear" empties it
// with Undo; the Completed archive searches, moves a task back and deletes
// several at once.
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { DEMO_START } from '@/lib/clock';
import { DAY } from '@/lib/time';
import { loadDemoData } from '@/lib/repo/demo';
import { addTask, moveTask } from '@/lib/repo/tasks';
import { AppShell } from '@/components/shell/AppShell';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { TasksScreen } from './TasksScreen';
import { CompletedArchive } from './CompletedArchive';

async function board() {
  navigation.pathname = '/tasks';
  return renderApp(
    <AppShell>
      <TasksScreen />
    </AppShell>,
  );
}

beforeEach(async () => {
  await resetApp();
});

describe('finished tasks', () => {
  it('shows only the last day on the demo board, and links to the rest', async () => {
    await loadDemoData();
    const done = (await db.tasks.toArray()).filter((t) => t.status === 'done');
    const recent = done.filter((t) => t.doneAt! >= DEMO_START - DAY).length;
    expect(recent).toBeLessThan(done.length);
    const { user } = await board();
    await user.click(await screen.findByRole('button', { name: `Done (${recent})` }));
    expect(screen.getByRole('link', { name: `Completed earlier (${done.length - recent})` })).toHaveAttribute('href', '/tasks/completed');
  });

  it('"Clear" empties the column, and Undo brings the tasks back', async () => {
    for (const title of ['Email TA', 'Laundry']) await moveTask((await addTask({ title, type: 'admin', energyCost: 1 })).id, 'done');
    const { user } = await board();
    await user.click(await screen.findByRole('button', { name: 'Done (2)' }));
    await user.click(screen.getByRole('button', { name: 'Clear finished tasks from the board' }));
    expect(await screen.findByRole('button', { name: 'Done (0)' })).toBeInTheDocument();
    expect(screen.getByText('Nothing finished in the last day.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "See everything you've finished" })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(await screen.findByRole('button', { name: 'Done (2)' })).toBeInTheDocument();
  });

  it('the archive searches, moves a task back, and deletes several at once', async () => {
    const ids: string[] = [];
    for (const title of ['Read chapter 4', 'Email TA', 'Laundry']) {
      const t = await addTask({ title, type: 'studying', energyCost: 1 });
      await moveTask(t.id, 'done');
      ids.push(t.id);
    }
    navigation.pathname = '/tasks/completed';
    const { user } = await renderApp(
      <AppShell>
        <CompletedArchive />
      </AppShell>,
    );
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'On your shore' })[0].getAttribute('href')).toMatch(/^\/shore\?item=/);

    await user.type(screen.getByLabelText('Search finished tasks'), 'chapter');
    expect(screen.getByText('Read chapter 4')).toBeInTheDocument();
    expect(screen.queryByText('Laundry')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Move back to In progress' }));
    await waitFor(async () => expect((await db.tasks.get(ids[0]))?.status).toBe('in_progress'));
    await user.clear(screen.getByLabelText('Search finished tasks'));

    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Email TA' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Laundry' }));
    await user.click(screen.getByRole('button', { name: 'Delete selected (2)' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete 2 tasks?' });
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    await waitFor(async () => expect((await db.tasks.get(ids[2]))?.deletedAt).toBeDefined());
    expect(await screen.findByText('Finished tasks will rest here.')).toBeInTheDocument();
    cleanup();
  });
});
