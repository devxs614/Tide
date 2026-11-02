// The calendar (v2.1 F-10, spec 14.8) on Maya's demo data, with "today" on
// Thursday, November 5: the month adds up each day's events, tasks and
// closes; large text shows a list; the keyboard moves through the month;
// a past day shows its history; a weekly event added on a future day
// fills the following weeks; and "this and future" deletes from there.
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { loadDemoData } from '@/lib/repo/demo';
import { loadMonth } from '@/lib/calendar/data';
import { setSettings } from '@/lib/repo/settings';
import { AppShell } from '@/components/shell/AppShell';
import { TodayScreen } from '@/components/today/TodayScreen';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { CalendarScreen } from './CalendarScreen';
import { CalendarDayScreen } from './CalendarDayScreen';

function shell(path: string, page: React.ReactElement) {
  navigation.pathname = path;
  return renderApp(<AppShell>{page}</AppShell>);
}

beforeEach(async () => {
  await resetApp();
  await loadDemoData();
});

describe('the calendar', () => {
  it('adds up each day of the month', async () => {
    const days = await loadMonth('2026-11-01', '2026-11-30');
    expect(days['2026-11-05'].events.map((e) => e.title)).toEqual(expect.arrayContaining(['Chemistry lab', 'Calculus']));
    const due = (await db.tasks.toArray()).filter((t) => t.due === '2026-11-06' && t.status !== 'done' && !t.deletedAt).length;
    expect(days['2026-11-06']?.tasksDue ?? 0).toBe(due);
    const closed = (await db.dayWraps.toArray()).filter((w) => w.completedAt && w.date.startsWith('2026-11'));
    for (const w of closed) expect(days[w.date].closed).toBe(true);
  });

  it('opens from Today, and moves through the month with the keyboard', async () => {
    const { user } = await shell('/', <TodayScreen />);
    expect(await screen.findByRole('link', { name: 'Calendar' })).toHaveAttribute('href', '/calendar');
    cleanup();
    await shell('/calendar', <CalendarScreen />);
    expect(await screen.findByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
    const todayCell = await screen.findByRole('button', { name: /^Thursday, November 5:/ });
    expect(todayCell).toHaveAttribute('aria-current', 'date');
    todayCell.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /^Friday, November 6:/ })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /^Friday, November 13:/ })).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(await screen.findByRole('heading', { name: 'December 2026' })).toBeInTheDocument();
    await user.keyboard('{PageUp}');
    expect(await screen.findByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Tuesday, November 3:/ }));
    expect(navigation.push).toHaveBeenCalledWith('/calendar/2026-11-03');
  });

  it('shows a list instead of the grid at large text', async () => {
    await setSettings({ textScale: 1.3 });
    await shell('/calendar', <CalendarScreen />);
    await screen.findByRole('heading', { name: 'November 2026' });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
  });

  it('a past day shows what happened', async () => {
    await shell('/calendar/2026-11-03', <CalendarDayScreen date="2026-11-03" />);
    expect(await screen.findByRole('heading', { name: 'Tuesday, November 3' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Check-ins' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add event' })).not.toBeInTheDocument();
  });

  it('adds a weekly event from a future day, and deletes this and future from there', async () => {
    const { user } = await shell('/calendar/2026-11-10', <CalendarDayScreen date="2026-11-10" />);
    await user.click(await screen.findByRole('button', { name: 'Add event' }));
    const form = await screen.findByRole('dialog', { name: 'Add an event' });
    await user.type(within(form).getByLabelText('What is it?'), 'Study group');
    await user.click(within(form).getByRole('radio', { name: 'Every week on…' }));
    await user.click(within(form).getByRole('button', { name: 'Add event' }));
    await waitFor(async () => expect((await db.events.toArray()).filter((e) => e.title === 'Study group').length).toBeGreaterThan(1));
    const studies = (await db.events.toArray()).filter((e) => e.title === 'Study group').sort((a, b) => a.start - b.start);
    // Tuesdays from Nov 10, eight weeks.
    expect(studies).toHaveLength(8);
    expect(new Date(studies[1].start).getDate()).toBe(17);
    expect(new Set(studies.map((e) => e.seriesId)).size).toBe(1);

    cleanup();
    const second = await shell('/calendar/2026-11-17', <CalendarDayScreen date="2026-11-17" />);
    await second.user.click(await screen.findByRole('button', { name: 'Study group' }));
    await second.user.click(within(await screen.findByRole('dialog', { name: 'Study group' })).getByRole('button', { name: 'Delete' }));
    await second.user.click(await screen.findByRole('button', { name: 'This and future events' }));
    await waitFor(async () => expect((await db.events.toArray()).filter((e) => e.title === 'Study group' && !e.deletedAt)).toHaveLength(1));
  });
});
