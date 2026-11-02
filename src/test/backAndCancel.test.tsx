// Flow tests for Back and Cancel (v2.1 F-08, spec 12.6): the check-in goes
// back without losing anything or asking the AI twice, and asks before
// throwing picks away; browser back closes it; Unstick goes back to the
// reasons; a strategy cancelled in its first 15 seconds leaves no trace,
// later it's an honest cancelled use with no re-check; and the pattern
// engine never counts a cancelled use.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { useCheckInSheet, useUnstickSheet } from '@/lib/ui';
import { addTask } from '@/lib/repo/tasks';
import { loadPatternInput } from '@/lib/patterns/data';
import { CheckInSheet } from '@/components/checkin/CheckInSheet';
import { UnstickSheet } from '@/components/tasks/UnstickSheet';
import { StrategyRunner } from '@/components/toolkit/StrategyRunner';
import { aiCalls, mockAi, navigation, renderApp, resetApp } from './utils';

const WORDS = {
  candidates: [
    { id: 'drained', definition: 'Low battery', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'Too big', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: 'Tired, or stuck?',
  safetyFlag: false,
};

function CheckIn() {
  const { openCheckIn } = useCheckInSheet();
  return (
    <>
      <button type="button" onClick={openCheckIn}>
        Open check-in
      </button>
      <CheckInSheet />
    </>
  );
}

beforeEach(async () => {
  await resetApp();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Back and Cancel', () => {
  it('check-in: Back keeps words and picks, reuses the suggestions, and Cancel asks first', async () => {
    const fetch = mockAi({ label: () => WORDS });
    const { user } = await renderApp(<CheckIn />);
    await user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await user.type(await screen.findByLabelText('In your own words'), 'Heavy day');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('checkbox', { name: /^Drained/ }));
    await user.click(screen.getByRole('checkbox', { name: /^Frustrated/ }));

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('In your own words')).toHaveValue('Heavy day');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('checkbox', { name: /^Drained/ })).toHaveAttribute('aria-checked', 'true');
    expect(aiCalls(fetch, 'label')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('checkbox', { name: /^Frustrated/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(await screen.findByRole('heading', { name: 'Leave without saving?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    await waitFor(() => expect(screen.queryByLabelText('In your own words')).not.toBeInTheDocument());
  });

  it('browser back closes the check-in sheet', async () => {
    mockAi({});
    const { user } = await renderApp(<CheckIn />);
    await user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await screen.findByLabelText('In your own words');
    act(() => window.history.back());
    await waitFor(() => expect(screen.queryByLabelText('In your own words')).not.toBeInTheDocument());
  });

  it('Unstick: Back goes to the reasons, and another reason asks again', async () => {
    const fetch = mockAi({});
    const task = await addTask({ title: 'Lab report', type: 'writing', energyCost: 3, status: 'stuck' });
    function Open() {
      const { openUnstick } = useUnstickSheet();
      return (
        <>
          <button type="button" onClick={() => openUnstick({ taskId: task.id })}>
            Open
          </button>
          <UnstickSheet />
        </>
      );
    }
    const { user } = await renderApp(<Open />);
    await user.click(await screen.findByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('button', { name: "I don't know where to start" }));
    await screen.findByRole('button', { name: /^Start/ });
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('button', { name: "I don't know where to start" })).toHaveAttribute('aria-current', 'true');
    await user.click(screen.getByRole('button', { name: /too big/i }));
    await screen.findByRole('button', { name: /^Start/ });
    expect(aiCalls(fetch, 'unstick')).toHaveLength(2);
  });

  it('a strategy cancelled in 5 seconds leaves nothing; after 20, an honest cancelled use', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = now();
    const first = await renderApp(<StrategyRunner id="c-box" context="toolkit" />);
    act(() => vi.setSystemTime(new Date(t0 + 5_000)));
    await first.user.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith('/toolkit'));
    expect(await db.strategyUses.count()).toBe(0);
    expect(await screen.findByText('Okay, stopped.')).toBeInTheDocument();
  });

  it('a strategy cancelled after 20 seconds is saved as cancelled, with no re-check', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = now();
    const { user } = await renderApp(<StrategyRunner id="c-box" context="toolkit" />);
    await screen.findByRole('button', { name: 'Cancel' });
    act(() => vi.setSystemTime(new Date(t0 + 20_000)));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(async () => expect(await db.strategyUses.count()).toBe(1));
    const [use] = await db.strategyUses.toArray();
    expect(use).toMatchObject({ strategyId: 'c-box', cancelled: true });
    expect(use.result).toBeUndefined();
    expect(screen.queryByRole('heading', { name: /How do you feel/i })).not.toBeInTheDocument();
  });

  it('the pattern engine never sees a cancelled use', async () => {
    await db.strategyUses.bulkAdd([
      { id: 'a', strategyId: 'c-box', ts: now(), context: 'toolkit', result: 'better' },
      { id: 'b', strategyId: 'c-box', ts: now(), context: 'toolkit', cancelled: true },
    ]);
    expect((await loadPatternInput(now(), 28)).strategyUses.map((u) => u.id)).toEqual(['a']);
  });
});
