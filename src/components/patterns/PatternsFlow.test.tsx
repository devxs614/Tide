// Flow test 10 from the spec, on a small fixture (the full demo seed is
// tested in Phase 8): the card numbers equal the engine's, "Why am I seeing
// this?" lists the evidence, and "Not true for me" sticks after a re-render.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { DAY, MINUTE } from '@/lib/time';
import { addTask } from '@/lib/repo/tasks';
import { addWin } from '@/lib/repo/wins';
import { addReward } from '@/lib/repo/rewards';
import { mockAi, navigation, renderApp, resetApp } from '@/test/utils';
import { PatternsScreen } from './PatternsScreen';
import { ProofScreen } from '@/components/proof/ProofScreen';

beforeEach(async () => {
  await resetApp({ aiEnabled: false });
});
afterEach(() => vi.unstubAllGlobals());

async function walkFixture() {
  const t0 = now();
  const essay = await addTask({ title: 'Essay', type: 'writing', energyCost: 2, status: 'done' });
  const outcomes = ['got_going', 'got_going', 'got_going', 'got_going', 'a_little'] as const;
  for (const [i, outcome] of outcomes.entries()) {
    const ts = t0 - (i + 1) * DAY;
    await db.strategyUses.add({ id: `walk-${i}`, strategyId: 'm-walk-3', ts, context: 'toolkit' });
    await db.focusBlocks.add({ id: `w-${i}`, taskId: essay.id, ts: ts + 5 * MINUTE, minutes: 10, completed: true, outcome });
  }
  for (const [i, outcome] of (['got_going', 'didnt_start', 'a_little', 'didnt_start'] as const).entries()) {
    await db.focusBlocks.add({ id: `b-${i}`, taskId: essay.id, ts: t0 - (10 + i) * DAY, minutes: 10, completed: true, outcome });
  }
  for (const [i, result] of (['better', 'better', 'better', 'better', 'same'] as const).entries()) {
    await db.strategyUses.add({ id: `box-${i}`, strategyId: 'c-box', ts: t0 - (i + 1) * DAY - 3 * 60 * MINUTE, context: 'bridge', result });
  }
}

describe('patterns screen', () => {
  it('flow 10: cards show the engine numbers, the evidence, and stay hidden once dismissed', async () => {
    await walkFixture();
    const { user } = await renderApp(<PatternsScreen />);

    const walkCard = (await screen.findByRole('heading', { name: '3-minute walk before writing tasks' })).closest('article')!;
    expect(within(walkCard).getByText('4 of 5 times · Last 4 weeks')).toBeInTheDocument();
    expect(within(walkCard).getByText('Confidence 2 of 4')).toBeInTheDocument();
    const boxCard = screen.getByRole('heading', { name: 'Box breathing tends to help you' }).closest('article')!;
    expect(within(boxCard).getByText('4 of 5 times · Last 4 weeks')).toBeInTheDocument();
    expect(screen.getByText('4 of 5 better')).toBeInTheDocument();

    await user.click(within(walkCard).getByRole('button', { name: 'Why am I seeing this?' }));
    expect(within(walkCard).getByText('From 5 times you used 3-minute walk before a writing task; you got going 4 times.')).toBeInTheDocument();
    expect(within(walkCard).getAllByRole('listitem')).toHaveLength(5);

    await user.click(within(walkCard).getByRole('button', { name: 'Not true for me' }));
    await user.click(await screen.findByRole('button', { name: 'It was a coincidence' }));
    await user.click(screen.getByRole('button', { name: 'Hide it' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: '3-minute walk before writing tasks' })).not.toBeInTheDocument());
    expect(await db.dismissedPatterns.get('strategyBeforeTask:m-walk-3:writing')).toMatchObject({ reason: 'It was a coincidence' });

    cleanup();
    await renderApp(<PatternsScreen />);
    expect(await screen.findByRole('heading', { name: 'Box breathing tends to help you' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '3-minute walk before writing tasks' })).not.toBeInTheDocument();
  });

  it('says plainly when there is not enough data yet', async () => {
    await renderApp(<PatternsScreen />);
    expect(await screen.findByText('Tide needs a few more check-ins and sessions to spot patterns. Nothing to do here yet.')).toBeInTheDocument();
    expect(screen.getByText('Patterns describe your data, not who you are. You decide what fits.')).toBeInTheDocument();
  });

  it('uses the AI wording when it is valid, with the engine numbers beside it', async () => {
    await resetApp({ aiEnabled: true });
    await walkFixture();
    mockAi({
      narrate: (body) => ({
        cards: (body as { patterns: Array<{ key: string }> }).patterns.map((p) => ({ key: p.key, title: `AI title for ${p.key.split(':')[1]}`, body: 'Often helps.', whyText: 'From your records.' })),
      }),
    });
    await renderApp(<PatternsScreen />);
    const card = (await screen.findByRole('heading', { name: 'AI title for m-walk-3' })).closest('article')!;
    expect(within(card).getByText('4 of 5 times · Last 4 weeks')).toBeInTheDocument();
  });
});

describe('proof log', () => {
  it('groups wins by day without counts, adds a win, and keeps rewards', async () => {
    await addWin('Finished: Lab outline', 'task');
    await addReward('Tea break');
    const { user } = await renderApp(<ProofScreen />);
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('Finished: Lab outline')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Add a win'), 'Answered my TA');
    await user.click(screen.getByRole('button', { name: 'Save win' }));
    expect(await screen.findByText('Answered my TA')).toBeInTheDocument();
    expect(screen.getByText('Tea break')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\b\d+ wins?\b/);
  });

  it('runs the safety check on a typed win', async () => {
    const { user } = await renderApp(<ProofScreen />);
    await user.type(await screen.findByLabelText('Add a win'), 'I want to die');
    await user.click(screen.getByRole('button', { name: 'Save win' }));
    expect(navigation.push).toHaveBeenCalledWith('/support?crisis=1');
    expect(await db.wins.count()).toBe(0);
  });
});
