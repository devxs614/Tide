// The voice settings' words (the picker, onboarding and the Studio), moved
// out of en.ts in v2.3: Today never shows them, and en.ts loads with
// Today's first page. `couldntPlay` stays in en.ts for useVoice.
import type { VoiceAccent } from '@/lib/types';

export const voiceCopy = {
  title: 'Voice',
  couldntPlay: "Couldn't play the voice on this device.",
  engine: 'How Tide reads aloud',
  engines: {
    auto: { name: 'Auto', description: 'The most natural voice available' },
    natural: { name: 'Natural', description: 'Cloud voices that sound like a person' },
    device: { name: 'Device', description: "Only this device's own voices" },
    off: { name: 'Off', description: 'Hide the read-aloud buttons' },
  },
  naturalUnavailable: "Natural voices aren't set up for this copy of Tide.",
  voiceNatural: 'Natural voices',
  voiceDevice: 'Device voices',
  playSample: 'Play sample',
  useThis: 'Use this voice',
  automatic: 'Automatic (the best voice here)',
  voiceSample: "Hi, I'm here to help you start small. Take your time.",
  voiceLimited:
    "Your device's voices are limited. For a more natural voice, try Microsoft Edge, or turn on Natural voices if your team set them up.",
  voicePrivacy:
    'Natural voices send the text being read to {provider} to turn it into audio. Tide only sends the text on screen that you asked to hear, never your history.',
  naturalAllowed: 'Allow natural voices',
  rate: 'Speed',
  rates: { slow: 'Slower', normal: 'Normal', fast: 'Faster' },
  accent: 'Accent',
  accents: {
    auto: 'Any',
    'en-US': 'US',
    'en-GB': 'British',
    'en-AU': 'Australian',
    'en-CA': 'Canadian',
    'en-IN': 'Indian',
    'en-IE': 'Irish',
    'en-ZA': 'South African',
  } satisfies Record<VoiceAccent, string>,
  autoReadAi: 'Read AI suggestions automatically',
  readCompanion: "Read my companion's words",
  breathingCues: 'Speak breathing cues',
  providers: { openai: 'OpenAI', elevenlabs: 'ElevenLabs' },
  breath: { in: 'Breathe in', hold: 'Hold', out: 'Breathe out' },
} as const;
