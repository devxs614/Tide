// Flow tests 5, 6 and 13 from the v2 spec (21.3), plus search and presets:
// a theme picked in Settings applies at once and Undo brings the old one
// back; the Low sensory preset changes exactly its keys and Undo restores
// them all; searching "dark mode" leads to the theme control and rings it.
import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { getSettings } from '@/lib/repo/settings';
import { PRESETS } from '@/lib/settings/presets';
import { searchSettings } from '@/lib/settings/searchIndex';
import type { Settings } from '@/lib/types';
import { renderApp, resetApp } from '@/test/utils';
import { SectionPage } from './SectionPage';
import { SettingsScreen } from './SettingsScreen';

beforeEach(async () => {
  await resetApp();
});

describe('Settings 2.0', () => {
  it('flow 5: a theme from Settings applies at once, and Undo works', async () => {
    await resetApp({ schemaVersion: 2, 'appearance.followSystem': false });
    const { user } = await renderApp(<SectionPage id="appearance" />);
    await user.click(await screen.findByRole('button', { name: /Sandbar/ }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('sandbar'));
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('lagoon'));
  });

  it('flow 6: Low sensory changes only its keys, and Undo restores them all', async () => {
    const { user } = await renderApp(<SettingsScreen />);
    const chip = await screen.findByRole('button', { name: 'Low sensory' });
    // Read "before" once the app has loaded (it saves its v2 migration then).
    await waitFor(async () => expect((await getSettings()).schemaVersion).toBe(2));
    const before = await getSettings();
    await user.click(chip);
    expect(screen.getByText(/This will change: .*theme → sandbar/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(async () => expect(await getSettings()).toMatchObject(PRESETS.lowSensory));
    const after = await getSettings();
    for (const key of Object.keys(after) as Array<keyof Settings>) {
      if (!(key in PRESETS.lowSensory)) expect(after[key], key).toEqual(before[key]);
    }
    // The Undo on this preset's own toast (an earlier test's may linger).
    const toastEl = (await screen.findByText('Low sensory applied.')).closest('[data-sonner-toast]') as HTMLElement;
    await user.click(within(toastEl).getByRole('button', { name: 'Undo' }));
    await waitFor(async () => expect(await getSettings()).toEqual(before));
  });

  it('flow 13: searching "dark mode" leads to the theme control and rings it', async () => {
    const { user } = await renderApp(<SettingsScreen />);
    await user.type(await screen.findByLabelText('Search settings'), 'dark mode');
    const link = await screen.findByRole('link', { name: /Theme/ });
    expect(link).toHaveAttribute('href', '/settings/appearance#setting-theme');
    window.history.replaceState(null, '', '/settings/appearance#setting-theme');
    await renderApp(<SectionPage id="appearance" />);
    await waitFor(() => expect(document.getElementById('setting-theme')).toHaveClass('setting-highlight'));
    window.history.replaceState(null, '', '/');
  });
});

describe('settings search', () => {
  it('finds settings by the words people use', () => {
    expect(searchSettings('dark mode')[0]).toMatchObject({ section: 'appearance', anchor: 'setting-theme' });
    expect(searchSettings('pet')[0].section).toBe('companion');
    expect(searchSettings('dyslexia')[0].anchor).toBe('setting-appearance-font');
    expect(searchSettings('vibrate')[0].section).toBe('sound');
    expect(searchSettings('animation')[0].section).toBe('motion');
    expect(searchSettings('zzzz')).toEqual([]);
  });
});
