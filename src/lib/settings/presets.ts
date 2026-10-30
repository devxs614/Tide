// Quick presets (v2 spec 15.3): one tap for a whole sensory profile. Each
// changes only the keys it lists, so picking "Low sensory" never touches
// Maya's name, companion or voice. Onboarding offers them as the "How do
// you like your senses?" step; Settings 2.0 offers them with Undo.
import type { Settings } from '@/lib/types';

export type PresetId = 'calm' | 'lowSensory' | 'focused' | 'playful' | 'highContrast';
export const PRESET_IDS: PresetId[] = ['calm', 'lowSensory', 'focused', 'playful', 'highContrast'];

export const PRESETS: Record<PresetId, Partial<Settings>> = {
  calm: {
    'appearance.theme': 'lagoon',
    'appearance.followSystem': false,
    'appearance.font': 'playful',
    'motion.level': 'calm',
    'motion.celebrations': 'gentle',
    'motion.confetti': false,
    'sound.enabled': false,
    'companion.talkativeness': 'some',
    'shore.sky': 'time',
  },
  lowSensory: {
    'appearance.theme': 'sandbar',
    'appearance.followSystem': false,
    'appearance.font': 'hyperlegible',
    'motion.level': 'off',
    'motion.celebrations': 'off',
    'motion.confetti': false,
    'sound.enabled': false,
    'haptics.enabled': false,
    'companion.talkativeness': 'quiet',
    'motion.companionIdle': false,
    'motion.shoreWaves': false,
    'appearance.density': 'comfortable',
    'appearance.roundness': 'soft',
  },
  focused: {
    'appearance.theme': 'oceanBlue',
    'appearance.followSystem': false,
    'appearance.font': 'hyperlegible',
    'motion.level': 'calm',
    'motion.celebrations': 'gentle',
    'companion.talkativeness': 'quiet',
    // Only plays if sound is on.
    'sound.ambience': 'brown',
    'focus.keepAwake': true,
  },
  playful: {
    'appearance.theme': 'bubblegum',
    'appearance.followSystem': false,
    'appearance.font': 'playful',
    'motion.level': 'lively',
    'motion.celebrations': 'full',
    'motion.confetti': true,
    'sound.enabled': true,
    'sound.volume': 0.5,
    'companion.talkativeness': 'chatty',
  },
  highContrast: {
    'appearance.followSystem': true,
    'appearance.lightTheme': 'pearl',
    'appearance.darkTheme': 'ink',
    'appearance.font': 'hyperlegible',
    'appearance.boldText': true,
    'appearance.quadrantPalette': 'colorblind',
    'appearance.showQuadrantShapes': true,
    'motion.level': 'calm',
  },
};

// Haptics are only switched on where the phone can vibrate (spec 15.3).
export function presetValues(id: PresetId, canVibrate: boolean): Partial<Settings> {
  const values = { ...PRESETS[id] };
  if (id === 'playful' && canVibrate) values['haptics.enabled'] = true;
  return values;
}

// "Skip setup" (spec 11.2): Lagoon, the Playful font, Calm motion, sound
// off, and Lolo in pink, so a skipped setup still feels like Tide v2.
export const SKIP_SETUP_DEFAULTS: Partial<Settings> = {
  'appearance.theme': 'lagoon',
  'appearance.followSystem': false,
  'appearance.font': 'playful',
  'motion.level': 'calm',
  'sound.enabled': false,
  'companion.species': 'axolotl',
  'companion.variant': 'pink',
};
