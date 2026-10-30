// Flow test 8 from the v2 spec (21.3), and more: a task done in Swell gets a
// small celebration; in Ebb, the toast "That counted." and no overlay; a big
// task in Swell opens the overlay, which Escape closes; and nothing is
// celebrated while box breathing holds celebrations.
import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { createCheckIn } from '@/lib/repo/checkins';
import { addTask } from '@/lib/repo/tasks';
import { holdCelebrations } from '@/lib/celebrate/store';
import { useTaskMoves } from '@/components/tasks/useTaskMoves';
import { renderApp, resetApp } from '@/test/utils';

function Finish({ taskId }: { taskId: string }) {
  const move = useTaskMoves();
  return (
    <button type="button" onClick={() => void move(taskId, 'done')}>
      Finish
    </button>
  );
}

async function setup(feeling: { energy: number; pleasantness: number } | null, energyCost: 1 | 2 | 3 = 1) {
  if (feeling) await createCheckIn({ emotions: [], ...feeling, aiUsed: false });
  const task = await addTask({ title: 'Read chapter 4', type: 'studying', energyCost });
  const { user } = await renderApp(<Finish taskId={task.id} />);
  await user.click(await screen.findByRole('button', { name: 'Finish' }));
  return user;
}

const effect = () => document.querySelector('[data-celebration]');

beforeEach(async () => {
  await resetApp({ 'motion.level': 'lively' });
});

describe('state-aware celebrations', () => {
  it('Swell: a small celebration with sparkles, and the usual toast', async () => {
    await setup({ energy: 3, pleasantness: 3 });
    await waitFor(() => expect(effect()).toHaveAttribute('data-celebration', 'small'));
    expect(effect()).toHaveAttribute('data-effect', 'sparkleBurst');
    expect(await screen.findByText('Done. Added to your proof log.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Ebb: the toast says "That counted." and there is no overlay', async () => {
    await setup({ energy: -3, pleasantness: -3 });
    expect(await screen.findByText('That counted.')).toBeInTheDocument();
    expect(screen.getByText('Added to your proof log.')).toBeInTheDocument();
    expect(effect()).toHaveAttribute('data-effect', 'glow');
    expect(document.querySelector('[data-celebration="big"]')).toBeNull();
  });

  it('a big task in Swell opens the overlay; Escape closes it', async () => {
    const user = await setup({ energy: 3, pleasantness: 3 }, 3);
    const dialog = await screen.findByRole('dialog', { name: 'Big one, done.' });
    expect(dialog).toHaveTextContent("Read chapter 4 is finished. It's on your shore now.");
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('a big task on a low day: kind words, no overlay', async () => {
    await setup({ energy: -3, pleasantness: -3 }, 3);
    expect(await screen.findByText('You did that on a low day. It counts.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('holds still while celebrations are held (box breathing, support pages)', async () => {
    const release = holdCelebrations();
    await setup({ energy: 3, pleasantness: 3 }, 3);
    expect(await screen.findByText('Done. Added to your proof log.')).toBeInTheDocument();
    expect(effect()).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    release();
  });
});
