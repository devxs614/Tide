// The cloud voices Tide can use when the team sets up a provider (v2 spec
// 7.6). OpenAI's names come from its text-to-speech guide (checked on
// 2026-10-29; marin and cedar are the ones it recommends for quality). The
// ElevenLabs ids are well-known premade voices; the team should confirm them
// in their own ElevenLabs voice library (TEAM_TODO), since libraries vary.
export type TtsProvider = 'openai' | 'elevenlabs';

export interface CloudVoice {
  id: string;
  name: string;
}

export const CLOUD_VOICES: Record<TtsProvider, CloudVoice[]> = {
  openai: [
    { id: 'marin', name: 'Marin' },
    { id: 'cedar', name: 'Cedar' },
    { id: 'coral', name: 'Coral' },
    { id: 'sage', name: 'Sage' },
    { id: 'shimmer', name: 'Shimmer' },
    { id: 'nova', name: 'Nova' },
    { id: 'alloy', name: 'Alloy' },
    { id: 'ash', name: 'Ash' },
    { id: 'ballad', name: 'Ballad' },
    { id: 'verse', name: 'Verse' },
  ],
  elevenlabs: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
  ],
};

export const DEFAULT_CLOUD_VOICE: Record<TtsProvider, string> = { openai: 'marin', elevenlabs: '21m00Tcm4TlvDq8ikWAM' };

// Each companion's voice when a cloud provider is on, matched to its
// personality. Only companion lines use these; everything else uses the
// voice Maya picked.
export const COMPANION_CLOUD_VOICE: Record<TtsProvider, Record<string, string>> = {
  openai: { otter: 'coral', axolotl: 'shimmer', capybara: 'sage', gecko: 'nova', jellyfish: 'ballad', hermit_crab: 'verse' },
  elevenlabs: {
    otter: 'EXAVITQu4vr4xnSDxMaL',
    axolotl: 'MF3mGyEYCl7XYWbV9V6O',
    capybara: 'pNInz6obpgDQGcFmaJgB',
    gecko: 'ErXwobaYiN019PkySvjV',
    jellyfish: '21m00Tcm4TlvDq8ikWAM',
    hermit_crab: 'TxGEqnHWrfWFTfGW9XjX',
  },
};

// How the voice should sound, sent to models that take instructions.
export const OPENAI_VOICE_INSTRUCTIONS =
  'Speak warmly, calmly and naturally, like a kind friend. Relaxed pace. No dramatic emphasis.';
