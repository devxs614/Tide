// Today's quick actions (v2 spec 12): Close the day opens two hours before
// the usual closing time (and stays open after midnight until the day
// starts); Focus asks which task, In progress first, never done or someday
// tasks.
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { addTask, letGo, moveTask } from '@/lib/repo/tasks';
import { renderApp, resetApp } from '@/test/utils';
import { closeDayOpen, QuickActions } from './QuickActions';

const at = (h: number, m = 0) => new Date(2026, 9, 30, h, m).getTime();

describe('quick actions', () => {
  it('opens Close the day from two hours before the closing time', () => {
    expect(closeDayOpen(at(19, 59), '22:00', '07:00')).toBe(false);
    expect(closeDayOpen(at(20, 0), '22:00', '07:00')).toBe(true);
    expect(closeDayOpen(at(1, 30), '22:00', '07:00')).toBe(true);
    expect(closeDayOpen(at(9, 0), '22:00', '07:00')).toBe(false);
  });

  it('shows "later" before then, and lists focus tasks in progress first', async () => {
    await resetApp({ 'day.wrapTime': '22:00', 'day.start': '07:00' });
    await addTask({ title: 'Read chapter 4', type: 'studying', energyCost: 2 });
    const going = await addTask({ title: 'Lab report', type: 'writing', energyCost: 2 });
    await moveTask(going.id, 'in_progress');
    const done = await addTask({ title: 'Email advisor', type: 'admin', energyCost: 1 });
    await moveTask(done.id, 'done');
    const aside = await addTask({ title: 'Clean the closet', type: 'chores', energyCost: 1 });
    await letGo(aside.id);

    const { user } = await renderApp(<QuickActions nowTs={at(10)} />);
    expect(await screen.findByRole('button', { name: 'Close the day · later' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Focus' }));
    const sheet = await screen.findByRole('dialog', { name: 'Focus on one thing' });
    const links = await within(sheet).findAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Lab reportIn progress', 'Read chapter 4Not started']);
    expect(links[0]).toHaveAttribute('href', `/focus/${going.id}`);
  });

  it('links Close the day in the evening', async () => {
    await resetApp({ 'day.wrapTime': '22:00', 'day.start': '07:00' });
    await renderApp(<QuickActions nowTs={at(21)} />);
    expect(await screen.findByRole('link', { name: 'Close the day' })).toHaveAttribute('href', '/wrap');
    expect(screen.getByRole('link', { name: 'Regulate' })).toHaveAttribute('href', '/toolkit');
  });
});
