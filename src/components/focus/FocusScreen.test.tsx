// Flow test 6 from the spec: a focus block measured with a moved clock, so
// it proves the timer reads timestamps rather than counting ticks.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { addTask } from '@/lib/repo/tasks';
import { addReward } from '@/lib/repo/rewards';
import { MINUTE } from '@/lib/time';
import { now } from '@/lib/clock';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { FocusScreen } from './FocusScreen';

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.useRealTimers());

describe('focus block', () => {
  it('flow 6: a 5-minute block ends from the clock alone and saves "Got going"', async () => {
    const task = await addTask({ title: 'Chemistry lab report', type: 'writing', energyCost: 3, status: 'in_progress' });
    await addReward('Tea break');
    const { user } = await renderApp(<FocusScreen taskId={task.id} />);

    await user.click(await screen.findByRole('button', { name: '5 min' }));
    // Only Date is faked: Dexie and React keep their real timers, while
    // jumping the system clock simulates a phone that slept for 5 minutes.
    vi.useFakeTimers({ toFake: ['Date'] });
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '5:00 left');

    act(() => vi.setSystemTime(new Date(now() + 5 * MINUTE + 1000)));
    expect(await screen.findByRole('heading', { name: 'How did it go?' }, { timeout: 3000 })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Got going' }));
    await waitFor(async () => expect(await db.focusBlocks.count()).toBe(1));
    const [block] = await db.focusBlocks.toArray();
    expect(block).toMatchObject({ taskId: task.id, minutes: 5, completed: true, outcome: 'got_going' });
    expect(await screen.findByText('You could take: Tea break.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to tasks' }));
    expect(navigation.push).toHaveBeenCalledWith('/tasks');
  });

  it('records an early end as not completed and offers a smaller step after "Didn\'t start"', async () => {
    const task = await addTask({ title: 'Laundry', type: 'chores', energyCost: 2, status: 'in_progress' });
    const { user } = await renderApp(<FocusScreen taskId={task.id} suggestedMinutes={10} />);
    expect(await screen.findByRole('button', { name: '10 min' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Paused')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    await user.click(screen.getByRole('button', { name: "I'm done early" }));
    await user.click(await screen.findByRole('button', { name: "Didn't start" }));
    expect(await screen.findByText("That's useful to know. Want a smaller step?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Smaller step' })).toBeInTheDocument();
    const [block] = await db.focusBlocks.toArray();
    expect(block).toMatchObject({ completed: false, outcome: 'didnt_start', minutes: 10 });
  });
});
