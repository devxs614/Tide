// v2.3 Item 1: the check-in button. Its rules (where it shows, scrolling,
// when it shrinks, the state ring), Quick check-in saving an ordinary
// check-in in two taps, the tab bar mode's sixth item, and the hidden mode
// keeping every other way to check in.
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { HOUR } from '@/lib/time';
import { fabCompact, fabShowsOn, ringFor, SCROLL_START, scrollStep } from '@/lib/checkin/fabRules';
import { openQuickCheckIn } from '@/lib/checkin/quickCheckIn';
import { runCustom } from '@/demo/director/customActions';
import type { CheckIn } from '@/lib/types';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { AppShell } from './AppShell';
import { TodayScreen } from '@/components/today/TodayScreen';

describe('check-in button rules', () => {
  it('shows on the main tabs and the calendar only', () => {
    for (const p of ['/', '/tasks', '/toolkit', '/patterns', '/shore', '/calendar', '/calendar/2026-11-12']) expect(fabShowsOn(p), p).toBe(true);
    for (const p of ['/settings', '/settings/appearance', '/tasks/completed', '/shore/collection', '/support', '/toolkit/c-box', '/proof']) expect(fabShowsOn(p), p).toBe(false);
  });

  it('hides after 24px down, comes back after 12px up or at the top', () => {
    let s = scrollStep(SCROLL_START, 10, 1000);
    expect(s.hidden).toBe(false);
    s = scrollStep(s, 40, 1000);
    expect(s.hidden).toBe(true);
    s = scrollStep(s, 35, 1000);
    expect(s.hidden).toBe(true);
    s = scrollStep(s, 25, 1000);
    expect(s.hidden).toBe(false);
    expect(scrollStep({ lastY: 300, hidden: true, run: 30 }, 0, 1000).hidden).toBe(false);
    expect(scrollStep({ lastY: 900, hidden: true, run: 30 }, 1000, 1000).hidden).toBe(false);
  });

  it('shrinks at big text, in a narrow frame, while scrolling, or over something to press', () => {
    const base = { textScale: 1, frameWidth: 390, scrolling: false, overInteractive: false };
    expect(fabCompact(base)).toBe(false);
    expect(fabCompact({ ...base, textScale: 1.3 })).toBe(true);
    expect(fabCompact({ ...base, frameWidth: 340 })).toBe(true);
    expect(fabCompact({ ...base, scrolling: true })).toBe(true);
    expect(fabCompact({ ...base, overInteractive: true })).toBe(true);
  });

  it('rings with the state of a check-in from the last six hours only', () => {
    const at = 1_000 * HOUR;
    const c = (ts: number) => ({ ts, quadrant: 'ebb' }) as CheckIn;
    expect(ringFor(c(at - 5 * HOUR), at)).toBe('ebb');
    expect(ringFor(c(at - 7 * HOUR), at)).toBeNull();
    expect(ringFor(undefined, at)).toBeNull();
  });
});

describe('check-in button modes', () => {
  it('Quick check-in saves an ordinary check-in in two taps, and Today shows it', async () => {
    await resetApp();
    navigation.pathname = '/';
    const { user } = await renderApp(
      <AppShell>
        <TodayScreen />
      </AppShell>,
    );
    openQuickCheckIn();
    const sheet = await screen.findByRole('dialog');
    await user.click(within(sheet).getByRole('button', { name: /Ebb/ }));
    await user.click(await within(sheet).findByRole('button', { name: 'Drained' }));
    const saved = await db.checkins.toArray();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ quadrant: 'ebb', emotions: ['drained'], quick: true, aiUsed: false });
    expect(await screen.findByRole('button', { name: 'Check in again' })).toBeInTheDocument();
  });

  it('"Skip" saves the middle of the state with no word', async () => {
    await resetApp();
    const { user } = await renderApp(<AppShell>{null}</AppShell>);
    openQuickCheckIn();
    const sheet = await screen.findByRole('dialog');
    await user.click(within(sheet).getByRole('button', { name: /Swell/ }));
    await user.click(await within(sheet).findByRole('button', { name: 'Skip' }));
    const [saved] = await db.checkins.toArray();
    expect(saved).toMatchObject({ quadrant: 'swell', emotions: [], energy: 3, pleasantness: 3, quick: true });
  });

  it('"In the tab bar" puts a sixth item in the middle that opens the check-in', async () => {
    await resetApp({ 'checkin.buttonMode': 'tabbar' });
    navigation.pathname = '/';
    const { user } = await renderApp(<AppShell>{null}</AppShell>);
    const nav = await screen.findByRole('navigation', { name: /tabs|main/i });
    const items = within(nav).getAllByRole('listitem').filter((li) => li.querySelector('a, button'));
    expect(items).toHaveLength(6);
    expect(items[2]).toHaveTextContent('Check in');
    expect(document.querySelector('[data-demo-id="fab-checkin"]')).toBeNull();
    await user.click(within(items[2]).getByRole('button', { name: 'Check in' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('"Hidden" draws no button, and the quick action and C still check in', async () => {
    await resetApp({ 'checkin.buttonMode': 'hidden' });
    navigation.pathname = '/';
    const { user } = await renderApp(
      <AppShell>
        <TodayScreen />
      </AppShell>,
    );
    await screen.findByRole('navigation', { name: /tabs|main/i });
    expect(document.querySelector('[data-demo-id="fab-checkin"]')).toBeNull();
    expect(document.querySelector('[data-demo-id="tab-checkin"]')).toBeNull();
    await waitFor(() => expect(document.querySelector('[data-demo-id="qa-checkin"]')).not.toBeNull());
    await user.keyboard('c');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  // The tour always starts in smart mode (the demo seeds it), so its one
  // way to open the check-in is tested here in the other two modes.
  it.each(['tabbar', 'hidden'] as const)('the demo director still opens the check-in in "%s" mode', async (mode) => {
    await resetApp({ 'checkin.buttonMode': mode });
    navigation.pathname = '/';
    await renderApp(
      <AppShell>
        <TodayScreen />
      </AppShell>,
    );
    await waitFor(() => expect(document.querySelector(mode === 'tabbar' ? '[data-demo-id="tab-checkin"]' : '[data-demo-id="qa-checkin"]')).not.toBeNull());
    await runCustom('openCheckIn', undefined, () => {}, 1);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
