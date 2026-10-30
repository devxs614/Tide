// Flow tests 1–3 from the v2 spec (21.3): all twelve onboarding steps with
// the keyboard (choices saved, the welcome shell on the shore, the companion
// on Today); "Skip setup" applying the defaults; and an existing v1 user
// seeing "What's new" once, where "Try the new look" applies Lagoon and the
// Playful font.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/repo/settings';
import { AppShell } from '@/components/shell/AppShell';
import { TodayHeader } from '@/components/today/TodayHeader';
import { mockAi, navigation, renderApp, resetApp, tabTo } from '@/test/utils';
import { OnboardingScreen } from './OnboardingScreen';

const AI_WORDS = {
  candidates: [
    { id: 'drained', definition: 'Low battery; starting anything feels like a lot', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked from something you want to get done', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'The task feels too big to hold at once', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: 'Is it more that you are tired, or that it feels too big?',
  safetyFlag: false,
};

afterEach(() => vi.unstubAllGlobals());

describe('onboarding 2.0', () => {
  beforeEach(async () => {
    await resetApp({ onboarded: false });
  });

  it('flow 1: twelve steps with the keyboard, then Today shows the companion', async () => {
    mockAi({ label: () => AI_WORDS });
    const { user } = await renderApp(<OnboardingScreen />);
    const press = async (name: string | RegExp) => {
      await tabTo(user, name, 80);
      await user.keyboard('{Enter}');
    };
    const at = (n: number) => screen.findByText(`Step ${n} of 12`);

    await at(1);
    await press("Let's set up your space");
    await at(2);
    await tabTo(user, 'Your name');
    await user.keyboard('Maya');
    await press('Next');
    await at(3);
    await press('Next companion');
    await press('Choose Lolo');
    await at(4);
    await press('Keep Lolo');
    await at(5);
    await press('Gold');
    await press('Looks good');
    await at(6);
    await press(/^Calm/);
    await press('Next');
    await at(7);
    await press('Next');
    await at(8);
    await press(/^Direct/);
    await press('Next');
    await at(9);
    await press('No thanks');
    await at(10);
    await press('Next');
    await at(11);
    await press('Next');
    await at(12);
    await press('Next');
    await press('Check in now');

    // The real check-in sheet, with hints at each step.
    expect(await screen.findByText('Write it however it comes out. Messy is fine.')).toBeInTheDocument();
    await user.type(await screen.findByLabelText('In your own words'), 'Nervous about tomorrow, but okay.');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('checkbox', { name: /^Drained/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Skip' }));
    expect(await screen.findByText('Choose what would help most right now.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Keep my plan/ }));

    expect(await screen.findByText('Your shore starts here. Every win leaves something on it.')).toBeInTheDocument();
    await press('Go to my day');
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/'));

    const s = await getSettings();
    expect(s).toMatchObject({
      onboarded: true,
      name: 'Maya',
      'companion.species': 'axolotl',
      'companion.name': '',
      'companion.variant': 'gold',
      communicationMode: 'direct',
      'motion.level': 'calm',
      'appearance.theme': 'lagoon',
    });
    expect(s.firsts.checkin).toBeGreaterThan(0);
    expect(await db.wins.filter((w) => w.kind === 'welcome').count()).toBe(1);
    expect(await db.checkins.count()).toBe(1);

    cleanup();
    await renderApp(<TodayHeader nowTs={Date.parse('2026-10-29T10:00:00')} />);
    await waitFor(() => expect(document.querySelector('svg[data-companion="axolotl"]')).not.toBeNull());
  });

  it('flow 2: "Skip setup" applies the defaults and goes to Today', async () => {
    const { user } = await renderApp(<OnboardingScreen />);
    await user.click(await screen.findByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Skip setup' }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/'));
    expect(await getSettings()).toMatchObject({
      onboarded: true,
      'appearance.theme': 'lagoon',
      'appearance.font': 'playful',
      'motion.level': 'calm',
      'sound.enabled': false,
      'companion.species': 'axolotl',
      'companion.variant': 'pink',
    });
    expect(await db.wins.filter((w) => w.kind === 'welcome').count()).toBe(1);
  });

  it('resumes where it was left', async () => {
    await resetApp({ onboarded: false, 'onboarding.step': 8 });
    await renderApp(<OnboardingScreen />);
    expect(await screen.findByText('Step 8 of 12')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How should Tide talk to you?' })).toBeInTheDocument();
  });
});

describe("existing v1 users: What's new", () => {
  it('flow 3: appears once, and "Try the new look" applies Lagoon and Playful', async () => {
    await resetApp({ 'appearance.theme': 'classic', 'appearance.font': 'hyperlegible', schemaVersion: 2 });
    navigation.pathname = '/';
    const { user } = await renderApp(
      <AppShell>
        <p>Today</p>
      </AppShell>,
    );
    expect(await screen.findByRole('dialog', { name: 'Meet the companions' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Maybe later' }));
    expect(await screen.findByRole('heading', { name: 'A fresh look' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try the new look' }));
    await waitFor(async () => expect(await getSettings()).toMatchObject({ 'appearance.theme': 'lagoon', 'appearance.font': 'playful' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect((await getSettings())['whatsNew.seen']).toBe(true);

    cleanup();
    await renderApp(
      <AppShell>
        <p>Today again</p>
      </AppShell>,
    );
    expect(await screen.findByText('Today again')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
