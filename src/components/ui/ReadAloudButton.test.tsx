// Flow test 15 from the v2 spec: "Read aloud" goes through the voice engine,
// which hands the device voice speech-ready text (numbers as English words,
// a full stop at the end), and the button turns into "Stop reading".
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { SPANISH_MAC } from '@/test/voices';
import { ReadAloudButton } from './ReadAloudButton';

const spoken = vi.hoisted(() => [] as string[][]);
vi.mock('@/lib/voice/browserEngine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/voice/browserEngine')>();
  return {
    ...actual,
    speakWithBrowser: vi.fn(async (chunks: string[], _opts: unknown, events: { onStart?: () => void }) => {
      spoken.push(chunks);
      events.onStart?.();
      return () => {};
    }),
  };
});

beforeEach(async () => {
  await resetApp({ 'voice.engine': 'device' });
  spoken.length = 0;
  vi.stubGlobal('speechSynthesis', { getVoices: () => SPANISH_MAC, cancel: () => {}, speak: () => {}, addEventListener: () => {}, removeEventListener: () => {} });
  vi.stubGlobal('SpeechSynthesisUtterance', class {});
});
afterEach(() => vi.unstubAllGlobals());

describe('Read aloud', () => {
  it('speaks through the voice engine with speech-ready text', async () => {
    const { user } = await renderApp(<ReadAloudButton text="Hold for 4" />);
    await user.click(await screen.findByRole('button', { name: 'Read aloud' }));
    await waitFor(() => expect(spoken).toEqual([['Hold for four.']]));
    expect(await screen.findByRole('button', { name: 'Stop reading' })).toBeInTheDocument();
  });

  it('is hidden when the voice is turned off', async () => {
    await resetApp({ 'voice.engine': 'off' });
    await renderApp(<ReadAloudButton text="Hold for 4" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('button', { name: 'Read aloud' })).not.toBeInTheDocument();
  });
});
