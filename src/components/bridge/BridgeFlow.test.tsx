// Flow test 8 from the spec: the Bridge from card to rating, including the
// trip to a strategy and back, and the parking note reaching the task.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { HOUR, MINUTE } from '@/lib/time';
import { addEvent } from '@/lib/repo/events';
import { addTask } from '@/lib/repo/tasks';
import { mockAi, navigation, renderApp, resetApp } from '@/test/utils';
import { TodayScreen } from '@/components/today/TodayScreen';
import { StrategyRunner } from '@/components/toolkit/StrategyRunner';
import { BridgeSheet } from './BridgeSheet';

function Today({ bridgeRef }: { bridgeRef?: string }) {
  return (
    <>
      <TodayScreen bridgeRef={bridgeRef} />
      <BridgeSheet />
    </>
  );
}

beforeEach(async () => {
  await resetApp();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('bridge', () => {
  it('flow 8: card → parking note → strategy → leave → rating → win', async () => {
    mockAi({});
    const t0 = now();
    await addEvent({ title: 'Chemistry lab', kind: 'lab', start: t0 - 2 * HOUR, end: t0 - MINUTE });
    const calc = await addEvent({
      title: 'Calculus',
      kind: 'class',
      start: t0 + 9 * MINUTE,
      end: t0 + 99 * MINUTE,
      place: 'Room 4-203',
      prep: ['Calculator', 'Notes from Tuesday'],
    });
    const report = await addTask({ title: 'Chemistry lab report', type: 'writing', energyCost: 3, status: 'in_progress' });

    const { user } = await renderApp(<Today />);
    expect(await screen.findByText('Chemistry lab → Calculus · leave in 9 min')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Get ready' }));

    expect(await screen.findByRole('heading', { name: 'Chemistry lab → Calculus' })).toBeInTheDocument();
    expect(screen.getByLabelText('Where are you leaving off?')).toHaveValue('Chemistry lab report: ');
    await user.type(screen.getByLabelText('Where are you leaving off?'), 'discussion section');
    await user.click(screen.getByRole('button', { name: 'Save note' }));
    await waitFor(async () => expect((await db.tasks.get(report.id))?.parkingNote).toBe('Chemistry lab report: discussion section'));
    for (const item of ['Calculator', 'Notes from Tuesday', 'Go to Room 4-203']) {
      expect(await screen.findByRole('checkbox', { name: item })).toBeInTheDocument();
    }

    // Shift: start the suggested strategy, which records against this switch.
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);
    const pushed = navigation.push.mock.calls.at(-1)![0] as string;
    const match = pushed.match(/^\/toolkit\/([^?]+)\?context=bridge&ref=(.+)$/);
    expect(match).not.toBeNull();
    const [, strategyId, transitionId] = match!;

    cleanup();
    const runner = await renderApp(<StrategyRunner id={strategyId} context="bridge" refId={transitionId} />);
    await runner.user.click(await screen.findByRole('button', { name: "I'm done" }));
    await runner.user.click(await screen.findByRole('button', { name: 'Better' }));
    await runner.user.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(navigation.push).toHaveBeenLastCalledWith(`/?bridge=${transitionId}`);

    cleanup();
    const back = await renderApp(<Today bridgeRef={transitionId} />);
    expect(await screen.findByText(/^Done: /)).toBeInTheDocument();
    await back.user.click(screen.getByRole('button', { name: "Done, I'm going" }));
    await waitFor(async () => expect(await db.transitions.count()).toBe(1));
    const [transition] = await db.transitions.toArray();
    const [use] = await db.strategyUses.toArray();
    expect(transition).toMatchObject({ id: transitionId, toEventId: calc.id, fromTaskId: report.id, strategyUseId: use.id });
    expect(transition.parkingNote).toBe('Chemistry lab report: discussion section');
    expect(use.transitionId).toBe(transitionId);

    // Ten minutes into Calculus, Today asks how the switch went.
    cleanup();
    vi.useFakeTimers({ toFake: ['Date'] });
    act(() => vi.setSystemTime(new Date(calc.start + 11 * MINUTE)));
    const later = await renderApp(<Today />);
    expect(await screen.findByRole('heading', { name: 'How was the switch from Chemistry lab to Calculus?' })).toBeInTheDocument();
    await later.user.click(screen.getByRole('button', { name: 'Okay' }));
    await waitFor(async () => expect((await db.transitions.get(transitionId))?.rating).toBe('okay'));
    const wins = (await db.wins.toArray()).map((w) => w.text);
    expect(wins).toContain('Got through: Chemistry lab → Calculus');
  });

  it('shows the next event card, not a bridge, when the event is more than 15 minutes away', async () => {
    const t0 = now();
    await addEvent({ title: 'Calculus', kind: 'class', start: t0 + 40 * MINUTE, end: t0 + 2 * HOUR });
    await renderApp(<Today />);
    expect(await screen.findByText(/^Next: Calculus · .* · in 40 min$/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Get ready' })).not.toBeInTheDocument();
  });
});
