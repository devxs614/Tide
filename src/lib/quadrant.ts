// Tide's four states. The two mood-map numbers (energy and pleasantness, each
// from -5 to 5) land in one of Surge, Swell, Ebb or Still.
// Inspired by the circumplex model of emotion and Yale's RULER framework.
// Tide is not affiliated with Yale and uses its own names and colors.
import type { Quadrant } from './types';

export const QUADRANTS: Quadrant[] = ['surge', 'swell', 'ebb', 'still'];

// Zero counts as "high" and "pleasant" on purpose: a neutral check-in
// shouldn't land someone in Ebb and trigger a lighter-day suggestion.
export function toQuadrant(energy: number, pleasantness: number): Quadrant {
  const high = energy >= 0;
  const pleasant = pleasantness >= 0;
  if (high && !pleasant) return 'surge';
  if (high && pleasant) return 'swell';
  if (!high && !pleasant) return 'ebb';
  return 'still';
}

// Rounds half away from zero. Math.round(-0.5) is -0, which counts as "high
// energy" and would put Drained + Frustrated (average energy -0.5) in Surge
// instead of Ebb. Halfway points should lean the way the feelings lean.
export function clampCoord(n: number): number {
  const rounded = Math.sign(n) * Math.round(Math.abs(n));
  return Math.max(-5, Math.min(5, rounded)) || 0;
}

// Where the mood-map dot sits when Maya picks one or two words: the average
// of their coordinates, rounded back onto the grid.
export function averagePoint(points: Array<{ energy: number; pleasantness: number }>): {
  energy: number;
  pleasantness: number;
} {
  if (points.length === 0) return { energy: 0, pleasantness: 0 };
  const energy = points.reduce((sum, pt) => sum + pt.energy, 0) / points.length;
  const pleasantness = points.reduce((sum, pt) => sum + pt.pleasantness, 0) / points.length;
  return { energy: clampCoord(energy), pleasantness: clampCoord(pleasantness) };
}
