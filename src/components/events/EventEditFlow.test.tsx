// Flow tests for v2.1 F-04 (spec 8.7) on Maya's demo afternoon: tap an
// event in the Tide Line and change its time, and the Tide Line follows;
// delete Calculus "only this" and no Bridge comes up at 4:41 pm; Undo
// brings the event and the Bridge back. Also: a Bridge sheet that's open
// when its event is deleted closes and says so.
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { DEMO_JUMP_TIME, loadDemoData, setDemoTime } from '@/lib/repo/demo';
import { deleteEvents } from '@/lib/repo/eventEdits';
import { AppShell } from '@/components/shell/AppShell';
import { TodayScreen } from '@/components/today/TodayScreen';
import { navigation, renderApp, resetApp } from '@/test/utils';

async function today() {
  navigation.pathname = '/';
  return renderApp(
    <AppShell>
      <TodayScreen />
    </AppShell>,
  );
}

const calculusToday = async () => (await db.events.toArray()).find((e) => e.title === 'Calculus' && new Date(e.start).getDate() === 5)!;

beforeEach(async () => {
  await resetApp();
  await loadDemoData();
});

describe('editing and deleting events', () => {
  it('changes one class time from the Tide Line, and the Tide Line follows', async () => {
    const { user } = await today();
    await user.click(await screen.findByRole('button', { name: 'Calculus' }));
    const details = await screen.findByRole('dialog', { name: 'Calculus' });
    expect(within(details).getByText(/^Repeats every Tue and Thu until/)).toBeInTheDocument();
    await user.click(within(details).getByRole('button', { name: 'Edit' }));

    const form = await screen.findByRole('dialog', { name: 'Edit event' });
    fireEvent.change(within(form).getByLabelText('Starts'), { target: { value: '17:00' } });
    fireEvent.change(within(form).getByLabelText('Ends'), { target: { value: '18:30' } });
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    const scope = await screen.findByRole('dialog', { name: 'Change which events?' });
    await user.click(within(scope).getByRole('button', { name: 'Change only this event' }));

    expect(await screen.findByText('5:00 pm – 6:30 pm · Room 4-203')).toBeInTheDocument();
    const calc = await calculusToday();
    expect(calc.detached).toBe(true);
    // Tuesday's class keeps its time.
    const tuesday = (await db.events.toArray()).find((e) => e.title === 'Calculus' && new Date(e.start).getDate() === 3);
    expect(new Date(tuesday!.start).getHours()).toBe(16);
  });

  it('an end before the start gets the midnight note, not a save', async () => {
    const { user } = await today();
    await user.click(await screen.findByRole('button', { name: 'Calculus' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Calculus' })).getByRole('button', { name: 'Edit' }));
    const form = await screen.findByRole('dialog', { name: 'Edit event' });
    fireEvent.change(within(form).getByLabelText('Ends'), { target: { value: '01:00' } });
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    expect(await within(form).findByText("Events can't cross midnight yet. Split it into two.")).toBeInTheDocument();
  });

  it('deletes Calculus "only this": no Bridge at 4:41 pm, and Undo brings both back', async () => {
    await setDemoTime(DEMO_JUMP_TIME);
    const { user } = await today();
    expect(await screen.findByText('Chemistry lab → Calculus · leave in 9 min')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Calculus' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Calculus' })).getByRole('button', { name: 'Delete' }));
    const confirm = await screen.findByRole('dialog', { name: /^Delete "Calculus" on Thursday, November 5\?$/ });
    expect(within(confirm).getByRole('button', { name: 'Keep it' })).toHaveFocus();
    await user.click(within(confirm).getByRole('button', { name: 'Delete only this event' }));

    await waitFor(() => expect(screen.queryByText(/Chemistry lab → Calculus/)).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Calculus' })).not.toBeInTheDocument();
    const live = (await db.events.toArray()).filter((e) => e.title === 'Calculus' && !e.deletedAt);
    expect(live.length).toBeGreaterThan(0);

    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(await screen.findByText('Chemistry lab → Calculus · leave in 9 min')).toBeInTheDocument();
    expect((await calculusToday()).deletedAt).toBeUndefined();
  });

  it('closes an open Bridge when its event is deleted, and says so', async () => {
    await setDemoTime(DEMO_JUMP_TIME);
    const { user } = await today();
    await user.click(await screen.findByRole('button', { name: 'Get ready' }));
    expect(await screen.findByText('Box breathing')).toBeInTheDocument();
    await deleteEvents((await calculusToday()).id, 'one');
    expect(await screen.findByText('That event was deleted.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Box breathing')).not.toBeInTheDocument());
  });
});
