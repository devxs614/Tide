// The words for "Try a look" (v2.1 F-11): the eight looks and the trying
// bar. Settings and What's new load these, not Today (D144).
import type { LookId } from '@/data/looks';

export const looksCopy = {
  title: 'Try a look',
  intro: 'A few ready-made combinations of colors, letters and movement. Try one; you can always go back.',
  tryIt: 'Try it',
  surprise: 'Surprise me',
  trying: 'Trying: {name}',
  keep: 'Keep it',
  back: 'Back to my look',
  next: 'Next look',
  kept: 'Kept the {name} look.',
  current: 'On now',
  looks: {
    lagoon_playful: { name: 'Lagoon', line: 'Fresh teal water, friendly and calm.' },
    sunset_lively: { name: 'Sunset', line: 'Warm, bright and bouncy.' },
    coral_bright: { name: 'Coral', line: 'Coral pink with turquoise.' },
    midnight_calm: { name: 'Midnight', line: 'A quiet night sea.' },
    kelp_cozy: { name: 'Kelp', line: 'Leafy greens, cozy and steady.' },
    lavender_soft: { name: 'Lavender', line: 'Soft lilac, easy on the eyes.' },
    sandbar_quiet: { name: 'Sandbar', line: 'Muted and quiet. Low stimulation.' },
    deepsea_glow: { name: 'Deep Sea', line: 'Deep blue with a glow.' },
  } satisfies Record<LookId, { name: string; line: string }>,
};
