// v2.3 Item 4: the Tasks board stays inside the phone frame. The frame is
// the same on every route (no more 1100px board), the swipe view's pills
// follow the column in view, the one-list view's folded groups are
// remembered, the quick filters combine, and moving a task still works.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, screen, within } from '@testing-library/react';
import { addTask } from '@/lib/repo/tasks';
import { getSettings } from '@/lib/repo/settings';
import { now } from '@/lib/clock';
import { toISODate } from '@/lib/time';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { AppShell } from '@/components/shell/AppShell';
import { TasksScreen } from './TasksScreen';

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.unstubAllGlobals());

describe('the app frame', () => {
  it.each(['/', '/tasks', '/tasks/completed', '/calendar'])('is the same phone-sized frame on %s', async (route) => {
    navigation.pathname = route;
    await renderApp(<AppShell>{null}</AppShell>);
    const frame = await screen.findByText((_, el) => el?.hasAttribute('data-app-frame') ?? false, { ignore: false });
    expect(frame.className).toContain('max-w-[430px]');
    expect(frame.className).not.toContain('1100px');
  });
});

describe('the tasks board', () => {
  it('swipe view: the pills follow the column in view', async () => {
    let fire: (status: string) => void = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (e: Array<{ isIntersecting: boolean; intersectionRatio: number; target: Element }>) => void) {
          fire = (status) => {
            const target = document.querySelector(`[data-board-column="${status}"]`)!;
            cb([{ isIntersecting: true, intersectionRatio: 0.9, target }]);
          };
        }
        observe() {}
        disconnect() {}
      },
    );
    await addTask({ title: 'Lab report', type: 'writing', energyCost: 2, status: 'in_progress' });
    await renderApp(<TasksScreen />);
    const pills = await screen.findByRole('group', { name: /status/i });
    expect(within(pills).getByRole('button', { name: /Not started/ })).toHaveAttribute('aria-pressed', 'true');
    act(() => fire('in_progress'));
    expect(within(pills).getByRole('button', { name: /In progress/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('list view: folding a group is remembered, and the menu still moves tasks', async () => {
    await resetApp({ 'tasks.boardView': 'list' });
    await addTask({ title: 'Email TA', type: 'admin', energyCost: 1 });
    const { user } = await renderApp(<TasksScreen />);
    await user.click(await screen.findByRole('button', { name: 'Hide Stuck' }));
    expect((await getSettings())['tasks.collapsedGroups']).toEqual(['stuck']);
    await user.click(await screen.findByRole('button', { name: 'Move to… Email TA' }));
    await user.click(await screen.findByRole('menuitem', { name: 'In progress' }));
    expect(await screen.findByRole('region', { name: 'In progress, 1 task' })).toBeInTheDocument();
    cleanup();
    await renderApp(<TasksScreen />);
    expect(await screen.findByRole('button', { name: 'Show Stuck' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('quick filters combine with AND, and clear', async () => {
    const today = toISODate(now());
    await addTask({ title: 'Due today, medium', type: 'admin', energyCost: 2, due: today });
    await addTask({ title: 'Light one', type: 'chores', energyCost: 1 });
    const { user } = await renderApp(<TasksScreen />);
    await screen.findByText('Light one');
    await user.click(screen.getByRole('button', { name: 'Light energy' }));
    expect(screen.queryByText('Due today, medium')).not.toBeInTheDocument();
    expect(screen.getByText('Light one')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Due today' }));
    expect(await screen.findByText('No tasks match these filters.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('Due today, medium')).toBeInTheDocument();
  });

  it('an empty Not started column offers Add task, and the view can be switched from the header', async () => {
    const { user } = await renderApp(<TasksScreen />);
    const column = await screen.findByRole('region', { name: 'Not started, 0 tasks' });
    await user.click(within(column).getByRole('button', { name: 'Add task' }));
    expect(await screen.findByLabelText('Task')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('radio', { name: 'One list' }));
    expect((await getSettings())['tasks.boardView']).toBe('list');
  });
});
