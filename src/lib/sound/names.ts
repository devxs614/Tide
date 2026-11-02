// The names of Tide's sounds and their categories. Kept apart from the
// synthesis code so a component can name a sound without loading the
// engine; the engine only loads once sound is turned on.

export type SoundName =
  | 'tap'
  | 'toggle'
  | 'select'
  | 'success'
  | 'celebrate-small'
  | 'celebrate-big'
  | 'water-drop'
  | 'wave'
  | 'bottle'
  | 'chirp-otter'
  | 'chirp-axolotl'
  | 'chirp-capybara'
  | 'chirp-gecko'
  | 'chirp-jellyfish'
  | 'chirp-hermit_crab'
  | 'breath-in'
  | 'breath-out'
  | 'focus-end';

export type SoundCategory = 'ui' | 'celebration' | 'companion' | 'ambience';
export type Ambience = 'none' | 'waves' | 'rain' | 'brown';

// v2.1 F-09: the nine background sounds of the ambience player. The v2
// three (waves, rain, brown) keep their sound.
export type AmbienceId = 'white' | 'pink' | 'brown' | 'rain' | 'waves' | 'fan' | 'stream' | 'binaural_focus' | 'binaural_calm';
export const AMBIENCE_IDS: AmbienceId[] = ['white', 'pink', 'brown', 'rain', 'waves', 'fan', 'stream', 'binaural_focus', 'binaural_calm'];
export const isBinaural = (id: AmbienceId) => id.startsWith('binaural');
