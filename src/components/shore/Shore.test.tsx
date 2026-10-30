// Flow tests 9 and 10 from the v2 spec (21.3), plus the bottle rules: after
// a task is done, the Shore shows the right item and tapping it explains it;
// a note written today surfaces only a day later, on an Ebb or Surge day,
// once, and keeping it adds a bottle win.
import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { realNow, setDemoClock } from '@/lib/clock';
import { db } from '@/lib/db';
import { getEligibleBottle, writeBottle } from '@/lib/repo/bottles';
import { createCheckIn } from '@/lib/repo/checkins';
import { addTask, moveTask } from '@/lib/repo/tasks';
import { DAY } from '@/lib/time';
import { BottleCard } from '@/components/today/BottleCard';
import { renderApp, resetApp } from '@/test/utils';
import { ShoreScreen } from './ShoreScreen';

const WED = new Date(2026, 9, 28, 10, 0).getTime();
const clockAt = (ts: number) => setDemoClock({ base: ts, startedAt: realNow() });

beforeEach(async () => {
  await resetApp();
});

describe('Your Shore', () => {
  it('flow 9: a finished studying task washes up as a scallop, and tapping it explains it', async () => {
    const task = await addTask({ title: 'Read chapter 4', type: 'studying', energyCost: 2 });
    await moveTask(task.id, 'done');
    const { user } = await renderApp(<ShoreScreen />);
    const item = await screen.findByRole('button', { name: /^Scallop,/ });
    expect(item).toHaveAttribute('data-item-type', 'scallop');
    await user.click(item);
    const sheet = await screen.findByRole('dialog', { name: 'Scallop' });
    expect(within(sheet).getByText('A scallop. You finished something you studied.')).toBeInTheDocument();
    expect(within(sheet).getByText('Finished: Read chapter 4')).toBeInTheDocument();
  });

  it('marks the shore as seen once opened', async () => {
    const task = await addTask({ title: 'Email TA', type: 'admin', energyCost: 1 });
    await moveTask(task.id, 'done');
    await renderApp(<ShoreScreen />);
    await screen.findByRole('button', { name: /^Cowrie,/ });
    await waitFor(async () => expect((await db.settings.get('shore.lastSeenAt'))?.value).toBeGreaterThan(0));
  });
});

describe('messages in a bottle', () => {
  it('surfaces only after a day, only on an Ebb or Surge day, one a day, oldest first', async () => {
    clockAt(WED);
    const first = await writeBottle('You have done hard weeks before.');
    clockAt(WED + 1000);
    await writeBottle('Breathe first.');
    clockAt(WED + 2 * 3600_000);
    await createCheckIn({ emotions: [], energy: -3, pleasantness: -3, aiUsed: false });
    expect(await getEligibleBottle(WED + 2 * 3600_000)).toBeNull();

    const thursday = WED + DAY + 3600_000;
    clockAt(thursday);
    expect(await getEligibleBottle(thursday)).toBeNull();
    await createCheckIn({ emotions: [], energy: 3, pleasantness: 3, aiUsed: false });
    expect(await getEligibleBottle(thursday)).toBeNull();
    clockAt(thursday + 60_000);
    await createCheckIn({ emotions: [], energy: 3, pleasantness: -3, aiUsed: false });
    expect((await getEligibleBottle(thursday + 60_000))?.id).toBe(first.id);
    setDemoClock(null);
  });

  it('flow 10: write → an Ebb check-in a day later → Today card → open → keep → a bottle win', async () => {
    clockAt(WED);
    await writeBottle('You have done hard weeks before.');
    const thursday = WED + DAY + 3600_000;
    clockAt(thursday);
    await createCheckIn({ emotions: [], energy: -3, pleasantness: -3, aiUsed: false });

    const { user } = await renderApp(<BottleCard />);
    expect(await screen.findByRole('heading', { name: 'A bottle washed up' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open it' }));
    const dialog = await screen.findByRole('dialog', { name: 'You wrote this on Wednesday, October 28' });
    expect(within(dialog).getByText('You have done hard weeks before.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Keep it on my shore' }));
    await waitFor(async () => expect(await db.wins.where('kind').equals('bottle').count()).toBe(1));
    const [bottle] = await db.bottles.toArray();
    expect(bottle).toMatchObject({ kept: true });
    expect(bottle.openedAt).toBeGreaterThan(0);
    setDemoClock(null);
  });
});
