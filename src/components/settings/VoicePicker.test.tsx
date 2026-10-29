// The read-aloud voice picker in Settings → Comfort, with the voice list of a
// Mac set to Spanish standing in for the browser's speech engine.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { getSettings, setSetting } from '@/lib/repo/settings';
import { renderApp, resetApp } from '@/test/utils';
import { SPANISH_MAC } from '@/test/voices';
import { VoicePicker } from './VoicePicker';

beforeEach(async () => {
  await resetApp();
  vi.stubGlobal('speechSynthesis', {
    getVoices: () => SPANISH_MAC,
    addEventListener: () => {},
    removeEventListener: () => {},
    cancel: () => {},
    speak: () => {},
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('VoicePicker', () => {
  it('offers Automatic and the readable English voices, and saves the choice', async () => {
    const { user } = await renderApp(<VoicePicker />);
    const select = await screen.findByLabelText('Read-aloud voice');
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Automatic (the gentlest clear voice here)',
      'Samantha · US English',
      'Moira · Irish English',
      'Daniel · British English',
      'Karen · Australian English',
    ]);
    await user.selectOptions(select, 'Moira');
    await waitFor(async () => expect((await getSettings()).readAloudVoice).toBe('Moira'));
    expect(screen.getByRole('button', { name: 'Try this voice' })).toBeInTheDocument();
  });

  it('shows Automatic when the saved voice is not on this device', async () => {
    await setSetting('readAloudVoice', 'Ava (Premium)');
    await renderApp(<VoicePicker />);
    expect(await screen.findByLabelText('Read-aloud voice')).toHaveValue('');
  });
});
