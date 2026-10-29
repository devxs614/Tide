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
