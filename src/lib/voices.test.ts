// Which voice "Read aloud" picks, using the voice list of a real Mac set to
// Spanish (default voice: Paulina), where English was read with an accent.
import { describe, expect, it } from 'vitest';
import { SPANISH_MAC, voice } from '@/test/voices';
import { clearestEnglishVoice, readableEnglishVoices, voiceFor } from './voices';

describe('voice choice', () => {
  it('picks Samantha over the Spanish default and the novelty and robotic voices', () => {
    expect(clearestEnglishVoice(SPANISH_MAC)?.name).toBe('Samantha');
  });

  it('offers only readable English voices, the gentle ones before the brisker ones', () => {
    expect(readableEnglishVoices(SPANISH_MAC).map((v) => v.name)).toEqual(['Samantha', 'Moira', 'Daniel', 'Karen']);
  });

  it('prefers a downloaded high-quality voice, whatever the system language calls it', () => {
    expect(clearestEnglishVoice([...SPANISH_MAC, voice('Ava (Premium)', 'en-US')])?.name).toBe('Ava (Premium)');
    expect(clearestEnglishVoice([...SPANISH_MAC, voice('Samantha (mejorada)', 'en-US')])?.name).toBe('Samantha (mejorada)');
  });

  it('chooses nothing when the only English voices are hard to understand', () => {
    expect(clearestEnglishVoice([voice('Paulina', 'es-MX', true, true), voice('Bubbles', 'en-US'), voice('Fred', 'en-US')])).toBeUndefined();
  });

  it('uses the voice chosen in Settings, or the best one when this device lacks it', () => {
    expect(voiceFor(SPANISH_MAC, 'Moira')?.name).toBe('Moira');
    expect(voiceFor(SPANISH_MAC, 'Ava (Premium)')?.name).toBe('Samantha');
    expect(voiceFor(SPANISH_MAC, '')?.name).toBe('Samantha');
  });
});
