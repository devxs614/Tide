// What "Read aloud" hands the speech engine (English words, the right voice,
// a calm pace), and that its button never gets stuck on "Stop reading".
import { afterEach, describe, expect, it, vi } from 'vitest';
import { speak } from './speech';
import { SPANISH_MAC } from '@/test/voices';

class Utterance {
  voice?: SpeechSynthesisVoice;
  lang = '';
  rate = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

// A fake speech engine that records what it was asked to read and never
// talks on its own; each test decides which events fire.
function fakeEngine() {
  const spoken: Utterance[] = [];
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  vi.stubGlobal('speechSynthesis', { cancel: () => {}, getVoices: () => SPANISH_MAC, speak: (u: Utterance) => spoken.push(u) });
  return spoken;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('speak', () => {
  it('reads numbers as English words, in an English voice, at a calm pace', () => {
    const spoken = fakeEngine();
    speak('Hold for 4.', { rate: 1, voiceName: '' });
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toMatchObject({ text: 'Hold for four.', lang: 'en-US', rate: 0.9 });
    expect(spoken[0].voice?.name).toBe('Samantha');
  });

  it('uses the voice and speed chosen in Settings', () => {
    const spoken = fakeEngine();
    speak('Hold for 4.', { rate: 0.8, voiceName: 'Moira' });
    expect(spoken[0].voice?.name).toBe('Moira');
    expect(spoken[0].rate).toBeCloseTo(0.72);
  });

  it('gives the button back if the device never starts talking', () => {
    vi.useFakeTimers();
    fakeEngine();
    const onEnd = vi.fn();
    speak('Hold for 4.', { rate: 1, voiceName: '' }, onEnd);
    vi.advanceTimersByTime(2999);
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('reports the end once when speech starts and finishes normally', () => {
    vi.useFakeTimers();
    const spoken = fakeEngine();
    const onEnd = vi.fn();
    speak('Hold for 4.', { rate: 1, voiceName: '' }, onEnd);
    spoken[0].onstart?.();
    vi.advanceTimersByTime(10_000);
    expect(onEnd).not.toHaveBeenCalled();
    spoken[0].onend?.();
    spoken[0].onerror?.();
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
