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
import { SectionPage } from './SectionPage';

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
    // v2 spec 3.5: Settings became an index plus one page per section, so
    // the same controls are found on their section pages.
    const { user } = await renderApp(<SectionPage id="appearance" />);

    await user.click(await screen.findByRole('button', { name: '150%' }));
    await waitFor(() => expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.5'));

    cleanup();
    const language = await renderApp(<SectionPage id="language" />);
    await language.user.click(await screen.findByRole('button', { name: /^Literal/ }));
    await waitFor(async () => expect((await getSettings()).communicationMode).toBe('literal'));
    cleanup();
    const sheet = await renderApp(<CheckInHarness />);
    await sheet.user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await sheet.user.click(await screen.findByRole('button', { name: 'Skip to the map' }));
    expect(await screen.findByRole('heading', { name: 'These words might fit. Choose up to two.' })).toBeInTheDocument();

    cleanup();
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
    const again = await renderApp(<SectionPage id="privacy" />);
    await again.user.click(await screen.findByRole('button', { name: 'Delete everything' }));
    expect(screen.getByRole('heading', { name: 'Delete everything?' })).toBeInTheDocument();
    await again.user.click(screen.getAllByRole('button', { name: 'Delete everything' }).at(-1)!);
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
    expect(await db.tasks.count()).toBe(0);
    expect(await db.settings.count()).toBe(0);
  });

  // v2 spec 3.5: the demo runs in its own workspace (its own database), so
  // starting it no longer replaces this device's data. Same intent as v1's
  // test (demo mode is a deliberate choice); the assertion is now that the
  // main data is untouched.
  it('starts the demo in its own workspace and leaves this data alone', async () => {
    await addTask({ title: 'My real task', type: 'admin', energyCost: 1 });
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { user } = await renderApp(<SectionPage id="demo" />);
    await user.click(await screen.findByRole('button', { name: 'Full tour' }));
    expect(window.localStorage.getItem('tide.workspace')).toBe('demo');
    expect(assign).toHaveBeenCalledWith('/?demo=start&mode=full');
    expect(await db.tasks.count()).toBe(1);
    expect((await getSettings()).demoMode).toBe(false);
    window.localStorage.removeItem('tide.workspace');
  });

});

describe('onboarding', () => {
  // v2 spec 3.5: onboarding grew from three steps to twelve. The navigation
  // here changed with it; what the test checks (choices apply at once, a
  // trusted person is saved, skipping works from any step) did not.
  it('walks the steps, applies preferences at once, and saves a trusted person', async () => {
    await resetApp({ onboarded: false });
    const { user } = await renderApp(<OnboardingScreen />);
    expect(await screen.findByText('Step 1 of 12')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Welcome to Tide.' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "Let's set up your space" }));
    // Steps 2–6 keep their defaults.
    for (let n = 2; n <= 6; n++) {
      await screen.findByText(`Step ${n} of 12`);
      await user.click(screen.getByRole('button', { name: 'Skip' }));
    }
    await screen.findByText('Step 7 of 12');
    await user.click(screen.getByRole('button', { name: /Midnight Tide/ }));
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true));
    for (let n = 7; n <= 11; n++) {
      await screen.findByText(`Step ${n} of 12`);
      await user.click(screen.getByRole('button', { name: 'Skip' }));
    }
    await screen.findByText('Step 12 of 12');
    await user.type(screen.getByLabelText('Name'), 'Sofi');
    await user.type(screen.getByLabelText('Number or handle'), '+52 81 0000 0000');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Skip' }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/'));
    const settings = await getSettings();
    expect(settings.onboarded).toBe(true);
    expect(settings.trustedContacts[0]).toMatchObject({ name: 'Sofi', method: 'phone' });
  });

  it('can be skipped from the first step', async () => {
    await resetApp({ onboarded: false });
    const { user } = await renderApp(<OnboardingScreen />);
    await user.click(await screen.findByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Skip setup' }));
    await waitFor(async () => expect((await getSettings()).onboarded).toBe(true));
  });
});

