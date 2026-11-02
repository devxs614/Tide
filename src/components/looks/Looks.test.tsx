// "Try a look" (v2.1 F-11) in Settings: try Sunset, go to the next look,
// go back to exactly the old look; try and keep; Surprise me picks a
// different look; leaving the page while trying keeps it, with Undo.
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { getSettings } from '@/lib/repo/settings';
import { renderApp, resetApp } from '@/test/utils';
import { LookCarousel } from './LookCarousel';

const MINE = { 'appearance.theme': 'ink', 'appearance.font': 'system', 'appearance.roundness': 'square', 'motion.level': 'auto', 'appearance.followSystem': true } as const;

beforeEach(async () => {
  await resetApp(MINE);
});

// The cards are in the list's order.
const NAMES = ['Lagoon', 'Sunset', 'Coral', 'Midnight', 'Kelp', 'Lavender', 'Sandbar', 'Deep Sea'];
const tryButton = (name: string) => screen.getAllByRole('button', { name: 'Try it' })[NAMES.indexOf(name)];

describe('try a look', () => {
  it('tries Sunset, moves on, and goes back to exactly the old look', async () => {
    const { user } = await renderApp(<LookCarousel />);
    await screen.findAllByRole('button', { name: 'Try it' });
    await user.click(tryButton('Sunset'));
    await waitFor(async () => expect((await getSettings())['appearance.theme']).toBe('sunsetShore'));
    expect(await screen.findByText('Trying: Sunset')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next look' }));
    await waitFor(async () => expect((await getSettings())['appearance.theme']).toBe('coralReef'));
    await user.click(screen.getByRole('button', { name: 'Back to my look' }));
    await waitFor(async () => expect(await getSettings()).toMatchObject({ ...MINE, 'appearance.lookSnapshot': null }));
    expect(screen.queryByText(/^Trying:/)).not.toBeInTheDocument();
  });

  it('keeps a look, and Surprise me picks a different one', async () => {
    const { user } = await renderApp(<LookCarousel />);
    await screen.findAllByRole('button', { name: 'Try it' });
    await user.click(tryButton('Kelp'));
    await user.click(await screen.findByRole('button', { name: 'Keep it' }));
    await waitFor(async () => expect(await getSettings()).toMatchObject({ 'appearance.theme': 'kelpForest', 'appearance.lookSnapshot': null }));
    await user.click(screen.getByRole('button', { name: 'Surprise me' }));
    await waitFor(async () => expect((await getSettings())['appearance.lookSnapshot']?.trying).toBeTruthy());
    expect((await getSettings())['appearance.lookSnapshot']?.trying).not.toBe('kelp_cozy');
  });

  it('leaving the page while trying keeps the look, with Undo', async () => {
    const { user } = await renderApp(<LookCarousel />);
    await screen.findAllByRole('button', { name: 'Try it' });
    await user.click(tryButton('Midnight'));
    await screen.findByText('Trying: Midnight');
    cleanup();
    await renderApp(<p>Elsewhere</p>);
    await waitFor(async () => expect((await getSettings())['appearance.lookSnapshot']).toBeNull());
    expect((await getSettings())['appearance.theme']).toBe('midnightTide');
  });
});
