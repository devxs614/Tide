// Which voice "Read aloud" uses, and that its button never gets stuck. The
// voice list mirrors a real Mac set to Spanish (default voice: Paulina).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearestEnglishVoice, speak } from './speech';

function voice(name: string, lang: string, localService = true, isDefault = false): SpeechSynthesisVoice {
  return { name, lang, localService, default: isDefault, voiceURI: name } as SpeechSynthesisVoice;
}

const SPANISH_MAC = [
  voice('Paulina', 'es-MX', true, true),
  voice('Albert', 'en-US'),
  voice('Bubbles', 'en-US'),
  voice('Eddy (inglés (Estados Unidos))', 'en-US'),
  voice('Fred', 'en-US'),
  voice('Zarvox', 'en-US'),
  voice('Daniel', 'en-GB'),
  voice('Samantha', 'en-US'),
  voice('Karen', 'en-AU'),
];

afterEach(() => vi.unstubAllGlobals());

describe('clearestEnglishVoice', () => {
  it('picks Samantha over the Spanish default and the novelty and robotic voices', () => {
    expect(clearestEnglishVoice(SPANISH_MAC)?.name).toBe('Samantha');
  });

  it('prefers a downloaded high-quality voice, whatever the system language calls it', () => {
    expect(clearestEnglishVoice([...SPANISH_MAC, voice('Ava (Premium)', 'en-US')])?.name).toBe('Ava (Premium)');
    expect(clearestEnglishVoice([...SPANISH_MAC, voice('Samantha (mejorada)', 'en-US')])?.name).toBe('Samantha (mejorada)');
  });

  it('chooses nothing when the only English voices are hard to understand', () => {
    expect(clearestEnglishVoice([voice('Paulina', 'es-MX', true, true), voice('Bubbles', 'en-US'), voice('Fred', 'en-US')])).toBeUndefined();
  });
});

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

describe('speak', () => {
  afterEach(() => vi.useRealTimers());

  it('reads in English with the chosen voice and the chosen speed', () => {
    const spoken = fakeEngine();
    speak('Hold for 4.', 0.8);
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toMatchObject({ text: 'Hold for 4.', lang: 'en-US', rate: 0.8 });
    expect(spoken[0].voice?.name).toBe('Samantha');
  });

  it('gives the button back if the device never starts talking', () => {
    vi.useFakeTimers();
    fakeEngine();
    const onEnd = vi.fn();
    speak('Hold for 4.', 1, onEnd);
    vi.advanceTimersByTime(2999);
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('reports the end once when speech starts and finishes normally', () => {
    vi.useFakeTimers();
    const spoken = fakeEngine();
    const onEnd = vi.fn();
    speak('Hold for 4.', 1, onEnd);
    spoken[0].onstart?.();
    vi.advanceTimersByTime(10_000);
    expect(onEnd).not.toHaveBeenCalled();
    spoken[0].onend?.();
    spoken[0].onerror?.();
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
