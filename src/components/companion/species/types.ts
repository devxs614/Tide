// What every species drawing receives. The figure wrapper decides the
// expression, breath and reactions; the drawing only draws.
import type { AccessoryId, Expression, VariantColors } from '@/lib/companion/registry';

export interface SpeciesArtProps {
  colors: VariantColors;
  expression: Expression;
  // Breath sync: eyes close on the in-breath.
  eyesClosed: boolean;
  accessory: AccessoryId;
  // Luma only: a face of two dots, or no face at all.
  faceStyle: 'dots' | 'none';
  // Luma only: glow color (her own, or her check-in's) and strength 0–1.
  glow: { color: string; strength: number };
}
