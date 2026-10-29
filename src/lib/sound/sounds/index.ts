// Every named sound and the category it belongs to, so the engine can apply
// the category switches in Settings (interface, celebrations, companion).
import { breathIn, breathOut, focusEnd } from './breath';
import { celebrateBig, celebrateSmall, success } from './celebration';
import { chirpAxolotl, chirpCapybara, chirpGecko, chirpHermitCrab, chirpJellyfish, chirpOtter } from './companion';
import { bottle, waterDrop, wave } from './shore';
import { select, tap, toggle } from './ui';
import type { SoundFn } from './kit';
import type { SoundCategory, SoundName } from '../names';

export const SOUNDS: Record<SoundName, { fn: SoundFn; category: SoundCategory }> = {
  tap: { fn: tap, category: 'ui' },
  toggle: { fn: toggle, category: 'ui' },
  select: { fn: select, category: 'ui' },
  success: { fn: success, category: 'celebration' },
  'celebrate-small': { fn: celebrateSmall, category: 'celebration' },
  'celebrate-big': { fn: celebrateBig, category: 'celebration' },
  'water-drop': { fn: waterDrop, category: 'celebration' },
  wave: { fn: wave, category: 'celebration' },
  bottle: { fn: bottle, category: 'celebration' },
  'chirp-otter': { fn: chirpOtter, category: 'companion' },
  'chirp-axolotl': { fn: chirpAxolotl, category: 'companion' },
  'chirp-capybara': { fn: chirpCapybara, category: 'companion' },
  'chirp-gecko': { fn: chirpGecko, category: 'companion' },
  'chirp-jellyfish': { fn: chirpJellyfish, category: 'companion' },
  'chirp-hermit_crab': { fn: chirpHermitCrab, category: 'companion' },
  'breath-in': { fn: breathIn, category: 'ui' },
  'breath-out': { fn: breathOut, category: 'ui' },
  'focus-end': { fn: focusEnd, category: 'ui' },
};
