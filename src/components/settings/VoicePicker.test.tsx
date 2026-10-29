// Settings → Voice (v2 spec 7.8). This replaces the D57 picker's test: the
// v2 spec moves read-aloud to the new voice engine (Section 3.5), so the
// picker now lists the device's best voices with samples and saves
// voice.deviceVoiceURI. Natural voices are offered only when configured.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { getSettings } from '@/lib/repo/settings';
import { resetTtsStatusForTests } from '@/lib/voice/cloudEngine';
import { renderApp, resetApp } from '@/test/utils';
import { SPANISH_MAC } from '@/test/voices';
import { VoicePicker } from './VoicePicker';

beforeEach(async () => {
  await resetApp();
  resetTtsStatusForTests();
  vi.stubGlobal('speechSynthesis', {
    getVoices: () => SPANISH_MAC,
    addEventListener: () => {},
    removeEventListener: () => {},
    cancel: () => {},
    speak: () => {},
  });
  vi.stubGlobal('SpeechSynthesisUtterance', class {});
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ available: false, provider: 'none', voices: [], maxChars: 600 }))));
});
afterEach(() => vi.unstubAllGlobals());

describe('Voice settings', () => {
  it('lists the readable device voices, best first, and saves the choice', async () => {
    const { user } = await renderApp(<VoicePicker />);
    const names = (await screen.findAllByRole('button', { name: /^Play sample: / })).map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['Play sample: Samantha', 'Play sample: Moira', 'Play sample: Daniel', 'Play sample: Karen']);
    await user.click(screen.getByRole('button', { name: /Moira/, pressed: false }));
    await waitFor(async () => expect((await getSettings())['voice.deviceVoiceURI']).toBe('Moira'));
  });

  it('shows Natural voices as unavailable when no provider is set up', async () => {
    await renderApp(<VoicePicker />);
    expect(await screen.findByRole('radio', { name: 'Natural' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText("Natural voices aren't set up for this copy of Tide.")).toBeInTheDocument();
  });
});
