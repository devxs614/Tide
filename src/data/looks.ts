// The curated looks of "Try a look" (v2.1 F-11, spec 15.2). A look sets
// only appearance and motion: never data, the companion, or anything else.
// Each turns off "follow my device", so the look tried is the look seen.
import type { Settings } from '@/lib/types';

export type LookId = 'lagoon_playful' | 'sunset_lively' | 'coral_bright' | 'midnight_calm' | 'kelp_cozy' | 'lavender_soft' | 'sandbar_quiet' | 'deepsea_glow';

export interface Look {
  id: LookId;
  values: Partial<Settings>;
}

const look = (id: LookId, values: Partial<Settings>): Look => ({
  id,
  // Motion Off also sets v1's reduceMotion, as Settings does.
  values: { 'appearance.followSystem': false, ...values, ...(values['motion.level'] && { reduceMotion: values['motion.level'] === 'off' }) },
});

export const LOOKS: Look[] = [
  look('lagoon_playful', { 'appearance.theme': 'lagoon', 'appearance.font': 'playful', 'appearance.roundness': 'round', 'appearance.density': 'comfortable', 'motion.level': 'calm' }),
  look('sunset_lively', { 'appearance.theme': 'sunsetShore', 'appearance.font': 'playful', 'appearance.roundness': 'round', 'motion.level': 'lively', 'motion.celebrations': 'full' }),
  look('coral_bright', { 'appearance.theme': 'coralReef', 'appearance.font': 'playful', 'appearance.roundness': 'round', 'motion.level': 'lively' }),
  look('midnight_calm', { 'appearance.theme': 'midnightTide', 'appearance.font': 'playful', 'appearance.roundness': 'soft', 'motion.level': 'calm' }),
  look('kelp_cozy', { 'appearance.theme': 'kelpForest', 'appearance.font': 'hyperlegible', 'appearance.roundness': 'soft', 'appearance.density': 'comfortable', 'motion.level': 'calm' }),
  look('lavender_soft', { 'appearance.theme': 'lavenderMist', 'appearance.font': 'lexend', 'appearance.roundness': 'round', 'motion.level': 'calm' }),
  look('sandbar_quiet', { 'appearance.theme': 'sandbar', 'appearance.font': 'hyperlegible', 'appearance.roundness': 'soft', 'motion.level': 'off', 'motion.celebrations': 'gentle' }),
  look('deepsea_glow', { 'appearance.theme': 'deepSea', 'appearance.font': 'playful', 'motion.level': 'lively' }),
];

export const getLook = (id: string) => LOOKS.find((l) => l.id === id);
