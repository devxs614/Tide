// Flow tests 11 and 12 from the v2 spec (21.3): Close the day all the way
// through with the AI mocked (the day is saved as closed, driftwood washes
// up, a loose end moves to tomorrow, an anchor and its first step are set,
// and the next morning Today shows them); and resuming at the step where
// Maya stopped.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { addTask, moveTask } from '@/lib/repo/tasks';
import { MorningCard } from '@/components/today/MorningCard';
import { mockAi, renderApp, resetApp } from '@/test/utils';
import { WrapScreen } from './WrapScreen';

const THU_EVENING = new Date(2026, 9, 29, 21, 0).getTime();
const FRI_MORNING = new Date(2026, 9, 30, 8, 30).getTime();
// Only Date is faked: the settings provider resets the demo clock outside
// demo mode, so tests set the system time itself.
const clockAt = (ts: number) => vi.setSystemTime(ts);
const SUMMARY = { summary: 'You closed the day gently.', highlight: 'A break helped.', tomorrowTip: 'Start with the first step.', companionLine: 'Rest now.' };

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  await resetApp({ 'companion.species': 'none' });
  clockAt(THU_EVENING);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Close the day', () => {
  it('flow 11: all the way through, then the morning card', async () => {
    mockAi({ wrapup: () => SUMMARY });
    const done = await addTask({ title: 'Email TA', type: 'admin', energyCost: 1 });
    await moveTask(done.id, 'done');
    const loose = await addTask({ title: 'Lab report', type: 'writing', energyCost: 3 });
    await moveTask(loose.id, 'in_progress');
    const anchor = await addTask({ title: 'Essay outline', type: 'writing', energyCost: 2 });

    const { user } = await renderApp(<WrapScreen />);
    await user.click(await screen.findByRole('button', { name: 'Start' }));
    await screen.findByRole('heading', { name: 'How are you arriving at the end of the day?' });
    await user.click(screen.getByRole('button', { name: 'Skip this step' }));
    expect(await screen.findByRole('heading', { name: 'Your day as a tide' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText(/Finished: Email TA/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { name: 'What helped?' });
    await user.click(screen.getByRole('button', { name: 'A break' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { name: 'What was hard?' });
    await user.click(screen.getByRole('button', { name: 'Starting things' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { name: 'If today were water, it was…' });
    await user.click(screen.getByRole('button', { name: /^Calm/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Lab report')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Tomorrow' }));
    await waitFor(async () => expect((await db.tasks.get(loose.id))?.movedTo).toBe('2026-10-30'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: 'Tomorrow' });
    await user.click(await screen.findByRole('button', { name: /Essay outline/ }));
    await user.click(await screen.findByRole('button', { name: 'Yes, find a first step' }));
    await waitFor(() => expect((screen.getByLabelText('First step') as HTMLInputElement).value).not.toBe(''));
    await user.click(screen.getByRole('button', { name: 'Save first step' }));
    await waitFor(async () => expect((await db.tasks.get(anchor.id))?.anchorDate).toBe('2026-10-30'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    // Wait for each new step before pressing Next again, so the click lands
    // on the new step and not on the one still leaving.
    expect(await screen.findByRole('heading', { name: 'A note for later' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('You closed the day gently.', {}, { timeout: 5000 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { name: 'Want help winding down?' });
    await user.click(screen.getByRole('button', { name: 'Just rest' }));
    expect(await screen.findByRole('heading', { name: 'Day closed. Sleep well.' })).toBeInTheDocument();

    await waitFor(async () => expect((await db.dayWraps.get('2026-10-29'))?.completedAt).toBeGreaterThan(0));
    const wrap = (await db.dayWraps.get('2026-10-29'))!;
    expect(wrap).toMatchObject({ helped: ['general:break'], hard: ['general:starting'], overall: 'okay', anchorTaskId: anchor.id });
    expect(wrap.aiSummary).toMatchObject({ ...SUMMARY, source: 'ai' });
    expect(await db.wins.where('kind').equals('wrap').count()).toBe(1);

    cleanup();
    clockAt(FRI_MORNING);
    await renderApp(<MorningCard nowTs={FRI_MORNING} />);
    expect(await screen.findByText('Your one thing today: Essay outline')).toBeInTheDocument();
    expect(screen.getByText(`First step: ${wrap.anchorFirstStep}`)).toBeInTheDocument();
  });

  it('flow 12: closing at step 6 and coming back resumes at step 6', async () => {
    const { user } = await renderApp(<WrapScreen />);
    await user.click(await screen.findByRole('button', { name: 'Start' }));
    for (const heading of ['How are you arriving at the end of the day?', 'Your day as a tide', 'Wins wash up', 'What helped?']) {
      await screen.findByRole('heading', { name: heading });
      await user.click(screen.getByRole('button', { name: 'Skip this step' }));
    }
    expect(await screen.findByRole('heading', { name: 'What was hard?' })).toBeInTheDocument();
    cleanup();
    await renderApp(<WrapScreen />);
    expect(await screen.findByRole('heading', { name: 'What was hard?' })).toBeInTheDocument();
  });
});
