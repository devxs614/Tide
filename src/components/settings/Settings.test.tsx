// Flow test 11 from the spec (text size, Literal mode, Delete everything),
// plus onboarding and turning demo mode on from Settings.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { addTask } from '@/lib/repo/tasks';
import { getSettings } from '@/lib/repo/settings';
import { useCheckInSheet } from '@/lib/ui';
import { CheckInSheet } from '@/components/checkin/CheckInSheet';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { mockAi, navigation, renderApp, resetApp } from '@/test/utils';
import { SettingsScreen } from './SettingsScreen';

function CheckInHarness() {
  const { openCheckIn } = useCheckInSheet();
  return (
    <>
      <button type="button" onClick={openCheckIn}>
        Open check-in
      </button>
      <CheckInSheet />
    </>
  );
}

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.unstubAllGlobals());

describe('settings', () => {
  it('flow 11: text size changes the root size, Literal changes the check-in wording, Delete everything empties the device', async () => {
    mockAi({});
    await addTask({ title: 'Laundry', type: 'chores', energyCost: 2 });
    const { user } = await renderApp(<SettingsScreen />);

    await user.click(await screen.findByRole('button', { name: '150%' }));
    await waitFor(() => expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.5'));

    await user.click(screen.getByRole('button', { name: /^Literal/ }));
    await waitFor(async () => expect((await getSettings()).communicationMode).toBe('literal'));
    cleanup();
    const sheet = await renderApp(<CheckInHarness />);
    await sheet.user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await sheet.user.click(await screen.findByRole('button', { name: 'Skip to the map' }));
    expect(await screen.findByRole('heading', { name: 'These words might fit. Choose up to two.' })).toBeInTheDocument();

    cleanup();
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
    const again = await renderApp(<SettingsScreen />);
    await again.user.click(await screen.findByRole('button', { name: 'Delete everything' }));
    expect(screen.getByRole('heading', { name: 'Delete everything?' })).toBeInTheDocument();
    await again.user.click(screen.getAllByRole('button', { name: 'Delete everything' }).at(-1)!);
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
    expect(await db.tasks.count()).toBe(0);
    expect(await db.settings.count()).toBe(0);
  });

  it('turns demo mode on only after the warning, and shows the demo clock', async () => {
    const { user } = await renderApp(<SettingsScreen />);
    await user.click(await screen.findByRole('switch', { name: 'Demo mode (synthetic data)' }));
    expect(screen.getByText(/This replaces what's on this device with example data/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use demo data' }));
    expect(await screen.findByText(/Demo clock: Thursday, November 5, 3:4\d pm/)).toBeInTheDocument();
    expect((await getSettings()).name).toBe('Maya');
    expect(await db.events.count()).toBeGreaterThan(30);
  });
});

describe('onboarding', () => {
  it('walks three steps, applies preferences at once, and saves a trusted person', async () => {
    await resetApp({ onboarded: false });
    const { user } = await renderApp(<OnboardingScreen />);
    expect(await screen.findByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tide helps you plan around how you actually feel.' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Dark' }));
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name'), 'Sofi');
    await user.type(screen.getByLabelText('Number or handle'), '+52 81 0000 0000');
    await user.click(screen.getByRole('button', { name: 'Start my day' }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/'));
    const settings = await getSettings();
    expect(settings.onboarded).toBe(true);
    expect(settings.trustedContacts[0]).toMatchObject({ name: 'Sofi', method: 'phone' });
  });

  it('can be skipped from the first step', async () => {
    await resetApp({ onboarded: false });
    const { user } = await renderApp(<OnboardingScreen />);
    await user.click(await screen.findByRole('button', { name: 'Skip' }));
    await waitFor(async () => expect((await getSettings()).onboarded).toBe(true));
  });
});
