// Which voice "Read aloud" uses. The lists below mirror a real Mac set to
// Spanish, where the browser's default was Paulina reading English.
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

describe('speak', () => {
  it('reads in English with the chosen voice and the chosen speed', () => {
    const spoken: Array<{ text: string; voice?: SpeechSynthesisVoice; lang: string; rate: number }> = [];
    class Utterance {
      voice?: SpeechSynthesisVoice;
      lang = '';
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    }
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
    vi.stubGlobal('speechSynthesis', { cancel: () => {}, getVoices: () => SPANISH_MAC, speak: (u: Utterance) => spoken.push(u) });

    speak('Hold for 4.', 0.8);
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toMatchObject({ text: 'Hold for 4.', lang: 'en-US', rate: 0.8 });
    expect(spoken[0].voice?.name).toBe('Samantha');
  });
});
