// Flow test 5 from the spec (Section 16.2), plus Unstick details: the
// "helped you k of n times" line from Maya's own history (not offered again
// once she is back from it), "Different step",
// and the "Move to…" menu as the non-drag way to change columns.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { MINUTE } from '@/lib/time';
import { addTask } from '@/lib/repo/tasks';
import { createCheckIn } from '@/lib/repo/checkins';
import { mockAi, navigation, renderApp, resetApp } from '@/test/utils';
import { TasksScreen } from './TasksScreen';
import { TaskCard } from './TaskCard';
import { clearSuggestions } from './unstickCache';
import { useLiveQuery } from 'dexie-react-hooks';

// The board always hands cards live data; this mirrors that for one card.
function LiveCard({ id }: { id: string }) {
  const task = useLiveQuery(() => db.tasks.get(id), [id]);
  return task ? <TaskCard task={task} /> : null;
}

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.unstubAllGlobals());

async function moveVia(user: Awaited<ReturnType<typeof renderApp>>['user'], title: string, target: string) {
  await user.click(await screen.findByRole('button', { name: `Move to… ${title}` }));
  await user.click(await screen.findByRole('menuitem', { name: target }));
}

describe('tasks flow', () => {
  it('flow 5: add a task, move it along without dragging, get unstuck and start a focus block', async () => {
    mockAi({});
    const { user } = await renderApp(<TasksScreen />);

    await user.click(await screen.findByRole('button', { name: 'Add task' }));
    await user.type(await screen.findByLabelText('Task'), 'Write the lab intro');
    await user.click(screen.getByRole('button', { name: 'Writing' }));
    await user.click(screen.getByRole('button', { name: 'Heavy' }));
    await user.click(screen.getByRole('button', { name: 'Tomorrow' }));
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('button', { name: 'Not started (1)' })).toBeInTheDocument();
    await moveVia(user, 'Write the lab intro', 'In progress');
    await waitFor(async () => expect((await db.tasks.toArray())[0].status).toBe('in_progress'));
    expect(screen.getByRole('button', { name: 'In progress (1)' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'In progress (1)' }));
    await moveVia(user, 'Write the lab intro', 'Stuck');
    await user.click(await screen.findByRole('button', { name: "I don't know where to start" }));

    expect(await screen.findByText('Open the document and type only the title.')).toBeInTheDocument();
    expect(screen.getByText('Try a 10-minute block.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start 10 min' }));

    const [task] = await db.tasks.toArray();
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith(`/focus/${task.id}?minutes=10`));
    const saved = await db.tasks.get(task.id);
    expect(saved?.status).toBe('in_progress');
    expect(saved?.stuckReason).toBe('dont_know_start');
    expect(saved?.firstStep).toBe('Open the document and type only the title.');
  });

  it('offers a strategy that helped before this kind of task, with the real numbers', async () => {
    mockAi({});
    const t0 = now();
    const essay = await addTask({ title: 'Old essay', type: 'writing', energyCost: 2, status: 'done' });
    const outcomes = ['got_going', 'got_going', 'got_going', 'got_going', 'a_little'] as const;
    for (const [i, outcome] of outcomes.entries()) {
      const ts = t0 - (i + 1) * 24 * 60 * MINUTE;
      await db.strategyUses.add({ id: `walk-${i}`, strategyId: 'm-walk-3', ts, context: 'toolkit' });
      await db.focusBlocks.add({ id: `fb-${i}`, taskId: essay.id, ts: ts + 5 * MINUTE, minutes: 10, completed: true, outcome });
    }
    await addTask({ title: 'Chemistry lab report', type: 'writing', energyCost: 3, status: 'stuck' });
    const { user } = await renderApp(<TasksScreen />);
    await user.click(await screen.findByRole('button', { name: 'Stuck (1)' }));
    await user.click(await screen.findByRole('button', { name: 'Your first step' }));
    await user.click(await screen.findByRole('button', { name: "I don't know where to start" }));

    expect(await screen.findByText('Before writing tasks, 3-minute walk helped you 4 of 5 times. Want to do that first?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Do it first' }));
    const lab = (await db.tasks.toArray()).find((t) => t.title === 'Chemistry lab report')!;
    expect(navigation.push).toHaveBeenCalledWith(`/toolkit/m-walk-3?context=unstick&ref=${lab.id}`);

    // Back from the walk: the same first step, without offering the walk again.
    cleanup();
    await renderApp(<TasksScreen resumeUnstickId={lab.id} />);
    expect(await screen.findByRole('heading', { name: 'Your first step' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Do it first' })).not.toBeInTheDocument();

    // After a reload the remembered step is gone; the saved reason still
    // skips the "What's making it hard?" question.
    cleanup();
    clearSuggestions();
    await renderApp(<TasksScreen resumeUnstickId={lab.id} />);
    expect(await screen.findByRole('heading', { name: 'Your first step' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "I don't know where to start" })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Do it first' })).not.toBeInTheDocument();
  });

  it('"Different step" gives a smaller step, and the state changes the step', async () => {
    mockAi({});
    await createCheckIn({ emotions: ['drained'], energy: -3, pleasantness: -3, aiUsed: false });
    await addTask({ title: 'Lab report', type: 'writing', energyCost: 3, status: 'stuck' });
    const { user } = await renderApp(<TasksScreen />);
    await user.click(await screen.findByRole('button', { name: 'Stuck (1)' }));
    await user.click(await screen.findByRole('button', { name: 'Your first step' }));
    await user.click(await screen.findByRole('button', { name: 'It feels too big' }));
    // Ebb: permission to stop after the step, and a 5-minute block.
    expect(await screen.findByText('Write only the first sentence of one section. You can stop after that.')).toBeInTheDocument();
    expect(screen.getByText('Try a 5-minute block.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Different step' }));
    expect(await screen.findByText('Open the document. Nothing else.')).toBeInTheDocument();
  });

  it('moves a finished task back, and keeps the win', async () => {
    mockAi({});
    const task = await addTask({ title: 'Pay phone bill', type: 'admin', energyCost: 1 });
    const { user } = await renderApp(<LiveCard id={task.id} />);
    await moveVia(user, 'Pay phone bill', 'Done');
    await waitFor(async () => expect((await db.tasks.get(task.id))?.status).toBe('done'));
    expect(await screen.findByText('Done. Added to your proof log.')).toBeInTheDocument();
    const menu = await screen.findByRole('button', { name: 'Move to… Pay phone bill' });
    await user.click(menu);
    expect(within(await screen.findByRole('menu')).getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['Not started', 'In progress', 'Stuck']);
    expect(await db.wins.count()).toBe(1);
  });
});
