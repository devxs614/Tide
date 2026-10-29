// Tailwind class names for each state, written out in full so Tailwind can
// find them when it scans the code. Color always comes with a word next to
// it; these classes are only ever the dot, the border or the tint. There is
// deliberately no text color: amber text on white fails contrast.
import type { Quadrant } from './types';

export const QUADRANT_STYLES: Record<Quadrant, { dot: string; tint: string; borderLeft: string; border: string }> = {
  surge: { dot: 'bg-surge', tint: 'bg-surge-tint', borderLeft: 'border-l-surge', border: 'border-surge' },
  swell: { dot: 'bg-swell', tint: 'bg-swell-tint', borderLeft: 'border-l-swell', border: 'border-swell' },
  ebb: { dot: 'bg-ebb', tint: 'bg-ebb-tint', borderLeft: 'border-l-ebb', border: 'border-ebb' },
  still: { dot: 'bg-still', tint: 'bg-still-tint', borderLeft: 'border-l-still', border: 'border-still' },
};
