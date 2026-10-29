// Flow test 7 from the spec (Day Mode with toggles and Undo), plus Today with
// no data, the banner's "Not now", the next-event card and "Bring back".
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { addDays, MINUTE, toISODate } from '@/lib/time';
import { addTask } from '@/lib/repo/tasks';
import { addEvent } from '@/lib/repo/events';
import { createCheckIn } from '@/lib/repo/checkins';
import { mockAi, renderApp, resetApp } from '@/test/utils';
import { TodayScreen } from './TodayScreen';
import { DayModeSheet } from './DayModeSheet';

function Today() {
  return (
    <>
      <TodayScreen />
      <DayModeSheet />
    </>
  );
}

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.unstubAllGlobals());

async function demoBoard() {
  const today = toISODate(now());
  const tomorrow = toISODate(addDays(now(), 1));
  const later = toISODate(addDays(now(), 4));
  await addTask({ title: 'Chemistry lab report', type: 'writing', energyCost: 3, due: tomorrow, status: 'in_progress' });
  await addTask({ title: 'Calculus problem set 7', type: 'studying', energyCost: 2, due: tomorrow });
  await addTask({ title: 'Read Physics chapter 4', type: 'studying', energyCost: 2, due: later });
  await addTask({ title: 'Email TA about lab data', type: 'admin', energyCost: 1, due: today });
  await addTask({ title: 'Reply to group project chat', type: 'social', energyCost: 1 });
  await addTask({ title: 'Laundry', type: 'chores', energyCost: 2 });
}

describe('Today', () => {
  it('renders calmly with no data at all', async () => {
    await renderApp(<Today />);
    expect(await screen.findByRole('heading', { name: 'How are you arriving today?' })).toBeInTheDocument();
    expect(screen.getByText('No events today.')).toBeInTheDocument();
    expect(screen.getByText('Nothing on your list for today.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Make today lighter' })).not.toBeInTheDocument();
  });

  it('flow 7: Ebb check-in → banner → Gentle → toggle a task → use the plan → Undo restores it all', async () => {
    mockAi({});
    await demoBoard();
    await createCheckIn({ emotions: ['drained'], energy: -3, pleasantness: -3, aiUsed: false });
    const { user } = await renderApp(<Today />);

    expect(await screen.findByText('Low on energy today? A Gentle plan keeps what matters and moves the rest.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show me' }));
    await user.click(await screen.findByRole('button', { name: /Gentle/ }));

    const keepSide = await screen.findByRole('region', { name: 'Keep today' });
    expect(within(keepSide).getByText('Email TA about lab data')).toBeInTheDocument();
    expect(within(keepSide).getByText('Chemistry lab report')).toBeInTheDocument();
    expect(screen.getByText('Kept energy: 4 of about 4')).toBeInTheDocument();

    // Maya overrides the suggestion: she keeps the laundry today too.
    await user.click(screen.getByRole('button', { name: 'Keep today: Laundry' }));
    expect(screen.getByText('Kept energy: 6 of about 4')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use this plan' }));

    const today = toISODate(now());
    await waitFor(async () => expect(await db.dayPlans.get(today)).toBeTruthy());
    const plan = (await db.dayPlans.get(today))!;
    expect(plan.mode).toBe('gentle');
    const titles = async (ids: string[]) => (await db.tasks.bulkGet(ids)).map((t) => t!.title).sort();
    expect(await titles(plan.keptTaskIds)).toEqual(['Chemistry lab report', 'Email TA about lab data', 'Laundry']);
    expect(await titles(plan.movedTaskIds)).toEqual(['Calculus problem set 7', 'Read Physics chapter 4', 'Reply to group project chat']);
    expect(await db.tasks.count()).toBe(6);
    expect(await screen.findByText('Moved to tomorrow (3)')).toBeInTheDocument();
    // The banner goes away once a lighter plan is in place.
    expect(screen.queryByText(/A Gentle plan keeps what matters/)).not.toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(async () => expect(await db.dayPlans.get(today)).toBeUndefined());
    const restored = await db.tasks.toArray();
    restored.forEach((t) => {
      expect(t.movedFrom).toBeUndefined();
      expect(t.movedTo).toBeUndefined();
    });
  });

  it('"Not now" hides the banner until the next check-in', async () => {
    mockAi({});
    await createCheckIn({ emotions: ['drained'], energy: -3, pleasantness: -3, aiUsed: false });
    const { user } = await renderApp(<Today />);
    await user.click(await screen.findByRole('button', { name: 'Not now' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Show me' })).not.toBeInTheDocument());
    await createCheckIn({ emotions: ['exhausted'], energy: -5, pleasantness: -3, aiUsed: false });
    expect(await screen.findByRole('button', { name: 'Show me' })).toBeInTheDocument();
  });

  it('shows the next event within three hours and brings a moved task back', async () => {
    const start = now() + 70 * MINUTE;
    await addEvent({ title: 'Calculus', kind: 'class', start, end: start + 90 * MINUTE, place: 'Room 4-203' });
    const today = toISODate(now());
    const task = await addTask({ title: 'Laundry', type: 'chores', energyCost: 2 });
    await db.tasks.update(task.id, { movedFrom: today, movedTo: toISODate(addDays(now(), 1)) });
    const { user } = await renderApp(<Today />);

    expect(await screen.findByText(/^Next: Calculus · .* · in 70 min$/)).toBeInTheDocument();
    await user.click(screen.getByText('Moved to tomorrow (1)'));
    await user.click(screen.getByRole('button', { name: 'Bring back' }));
    await waitFor(async () => expect((await db.tasks.get(task.id))?.movedFrom).toBeUndefined());
  });
});
