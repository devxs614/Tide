// Flow test for background sounds (v2.1 F-09, spec 13.5): open Sounds on the
// Focus screen, pick Rain, start the block; on Today the mini player says
// "Rain · playing"; Stop there ends it. Web Audio is a fake that records.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { addTask } from '@/lib/repo/tasks';
import { getAmbienceState } from '@/lib/sound/ambienceState';
import { resetAmbiencePlayerForTests } from '@/lib/sound/ambiencePlayer';
import { installFakeAudio } from '@/test/fakeAudioContext';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { AppShell } from '@/components/shell/AppShell';
import { FocusScreen } from '@/components/focus/FocusScreen';
import { TodayScreen } from '@/components/today/TodayScreen';

beforeEach(async () => {
  await resetApp();
  resetAmbiencePlayerForTests();
  installFakeAudio();
});
afterEach(() => vi.unstubAllGlobals());

describe('background sounds', () => {
  it('picks Rain in Focus, shows the mini player on Today, and stops from it', async () => {
    const task = await addTask({ title: 'Lab report', type: 'writing', energyCost: 2, status: 'in_progress' });
    navigation.pathname = `/focus/${task.id}`;
    const { user } = await renderApp(
      <AppShell>
        <FocusScreen taskId={task.id} suggestedMinutes={10} />
      </AppShell>,
    );
    await user.click(await screen.findByRole('button', { name: 'Sounds' }));
    const sheet = await screen.findByRole('dialog', { name: 'Sounds' });
    // A playing tile's name starts with "Playing".
    const rain = () => within(sheet).getByRole('button', { name: /Rain\s*Light rain/ });
    await user.click(rain());
    await waitFor(() => expect(getAmbienceState().sound).toBe('rain'));
    expect(rain()).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Escape}');
    await user.click(await screen.findByRole('button', { name: 'Start' }));
    expect(await screen.findByRole('button', { name: 'Rain' })).toBeInTheDocument();
    expect(getAmbienceState().sound).toBe('rain');

    cleanup();
    navigation.pathname = '/';
    const today = await renderApp(
      <AppShell>
        <TodayScreen />
      </AppShell>,
    );
    const mini = await screen.findByRole('region', { name: 'Background sound' });
    expect(within(mini).getByText('Rain · playing')).toBeInTheDocument();
    await today.user.click(within(mini).getByRole('button', { name: 'Stop' }));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Background sound' })).not.toBeInTheDocument());
    expect(getAmbienceState().sound).toBeNull();
  });
});
