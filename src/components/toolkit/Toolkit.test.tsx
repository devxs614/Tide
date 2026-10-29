// Flow test 9 from the spec, plus the runner's other paths (Worse, Skip,
// coming from Unstick), the brain dump's safety check, reduced motion in the
// breathing square, and the toolkit list itself.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { STRATEGIES } from '@/data/strategies';
import { db } from '@/lib/db';
import { addTask } from '@/lib/repo/tasks';
import { createCheckIn } from '@/lib/repo/checkins';
import { recordStrategyUse } from '@/lib/repo/strategies';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { StrategyRunner } from './StrategyRunner';
import { ToolkitScreen } from './ToolkitScreen';
import { TOOLS } from './ToolArea';

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.unstubAllGlobals());

describe('strategy runner', () => {
  it('flow 9: Box breathing → finish → "Better" saves the use and adds a win', async () => {
    const { user } = await renderApp(<StrategyRunner id="c-box" context="toolkit" />);
    expect(await screen.findByRole('heading', { name: 'Box breathing' })).toBeInTheDocument();
    expect(await screen.findByText('Press Start when you are ready.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByText(/Breathe in · [1-4]/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stop' }));

    await user.click(await screen.findByRole('button', { name: 'Better' }));
    expect(await screen.findByText('Glad it helped. Added to your proof log.')).toBeInTheDocument();
    const [use] = await db.strategyUses.toArray();
    expect(use).toMatchObject({ strategyId: 'c-box', context: 'toolkit', result: 'better' });
    expect((await db.wins.toArray()).map((w) => w.text)).toEqual(['Felt better after: Box breathing']);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(navigation.push).toHaveBeenCalledWith('/toolkit');
  });

  it('thanks Maya for "Worse" and adds no win', async () => {
    const { user } = await renderApp(<StrategyRunner id="t-count-7" context="toolkit" />);
    await user.click(await screen.findByRole('button', { name: "I'm done" }));
    await user.click(await screen.findByRole('button', { name: 'Worse' }));
    expect(await screen.findByText('Thanks for telling me. Tide will suggest this less.')).toBeInTheDocument();
    expect((await db.strategyUses.toArray())[0].result).toBe('worse');
    expect(await db.wins.count()).toBe(0);
  });

  it('comes from Unstick with the task in the message, records the task, and goes back to it', async () => {
    const task = await addTask({ title: 'Chemistry lab report', type: 'writing', energyCost: 3, status: 'stuck' });
    const { user } = await renderApp(<StrategyRunner id="s-ask-help" context="unstick" refId={task.id} />);
    expect(await screen.findByDisplayValue(/I'm working on Chemistry lab report and I'm stuck/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(await screen.findByRole('button', { name: 'Skip' }));
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith(`/tasks?unstick=${task.id}`));
    const [use] = await db.strategyUses.toArray();
    expect(use).toMatchObject({ context: 'unstick', taskId: task.id });
    expect(use.result).toBeUndefined();
  });

  it('runs the safety check on a brain dump and keeps nothing when it fires', async () => {
    const { user } = await renderApp(<StrategyRunner id="cr-brain-dump" context="toolkit" />);
    await user.type(await screen.findByLabelText("What's in your head (one thing per line)"), 'laundry{Enter}I want to die');
    await user.click(screen.getByRole('button', { name: 'Turn lines into tasks' }));
    expect(navigation.push).toHaveBeenCalledWith('/support?crisis=1');
    expect(await db.tasks.count()).toBe(0);
  });

  it('turns chosen brain-dump lines into tasks', async () => {
    const { user } = await renderApp(<StrategyRunner id="cr-brain-dump" context="toolkit" />);
    await user.type(await screen.findByLabelText("What's in your head (one thing per line)"), 'laundry{Enter}email TA{Enter}buy milk');
    await user.click(screen.getByRole('button', { name: 'Turn lines into tasks' }));
    await user.click(screen.getByRole('checkbox', { name: 'email TA' }));
    await user.click(screen.getByRole('button', { name: 'Add 1 task' }));
    await waitFor(async () => expect((await db.tasks.toArray()).map((t) => t.title)).toEqual(['email TA']));
  });

  it('keeps the breathing dot still with reduced motion; only the words change', async () => {
    await resetApp({ reduceMotion: true });
    const { user } = await renderApp(<StrategyRunner id="c-box" context="toolkit" />);
    await user.click(await screen.findByRole('button', { name: 'Start' }));
    const square = screen.getByRole('img', { name: 'Breathing square' });
    expect(square.querySelector('.bg-primary')).toBeNull();
    expect(screen.getByText(/Breathe in · [1-4]/)).toBeInTheDocument();
  });
});

describe('toolkit list', () => {
  it('maps every strategy to a tool that exists', () => {
    for (const s of STRATEGIES) {
      expect(s.tool, s.id).toBeDefined();
      expect(TOOLS[s.tool!], s.id).toBeDefined();
      expect(s.steps.length, s.id).toBeLessThanOrEqual(5);
      s.steps.forEach((step) => expect(step.split(/\s+/).length, step).toBeLessThan(15));
    }
  });

  it('shows the current state, filters to it, and lifts what worked for Maya', async () => {
    await createCheckIn({ emotions: ['anxious'], energy: 3, pleasantness: -3, aiUsed: false });
    for (const result of ['better', 'better', 'same'] as const) await recordStrategyUse({ strategyId: 'c-box', context: 'toolkit', result });
    const { user } = await renderApp(<ToolkitScreen />);
    expect(await screen.findByRole('heading', { name: /For how you feel now:\s*Surge/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Works for you' })).toBeInTheDocument();
    expect(screen.getAllByText('Worked for you 2 of 3 times').length).toBeGreaterThan(0);
    // Calm opens first because the top suggestion for Surge is Box breathing.
    expect(screen.getByRole('tab', { name: 'Calm' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('link', { name: /Stairs once/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show all' }));
    await user.click(screen.getByRole('tab', { name: 'Move' }));
    expect(await screen.findByRole('link', { name: /Stairs once/ })).toBeInTheDocument();
  });
});
