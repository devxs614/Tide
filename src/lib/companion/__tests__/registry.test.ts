// The companion registry is complete (v2 spec 21.2): every species has a
// default name, four named color variants, all four attachment points, a
// sound and an About text; every accessory has a slot and a label; every
// expression has words for screen readers.
import { describe, expect, it } from 'vitest';
import { COMPANION_ABOUT, COMPANION_COPY } from '@/copy/companions';
import { ACCESSORIES, ACCESSORY_SLOT, COMPANIONS, EXPRESSIONS, PLACEMENTS, SPECIES, variantFor } from '../registry';

describe('companion registry', () => {
  it.each(SPECIES)('%s has a name, four variants, attachment points, a sound and an About', (species) => {
    const info = COMPANIONS[species];
    expect(info.defaultName.length).toBeGreaterThan(0);
    expect(info.variants).toHaveLength(4);
    expect(new Set(info.variants.map((v) => v.id)).size).toBe(4);
    for (const v of info.variants) {
      expect(COMPANION_COPY.variants[v.id]).toBeTruthy();
      for (const color of [v.main, v.shade, v.light, v.accent, v.blush]) expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
    for (const slot of ['head', 'face', 'neck', 'back'] as const) {
      const at = info.attach[slot];
      expect(at.x).toBeGreaterThanOrEqual(0);
      expect(at.x).toBeLessThanOrEqual(200);
      expect(at.y).toBeGreaterThanOrEqual(0);
      expect(at.y).toBeLessThanOrEqual(200);
      expect(at.scale).toBeGreaterThan(0);
    }
    expect(info.sound).toBe(`chirp-${species}`);
    expect(COMPANION_ABOUT[species].length).toBeGreaterThan(40);
    expect(COMPANION_COPY.species[species].kind).toBeTruthy();
  });

  it('falls back to the first variant for an unknown or empty variant', () => {
    expect(variantFor('otter', '')).toBe(COMPANIONS.otter.variants[0]);
    expect(variantFor('otter', 'cocoa').id).toBe('cocoa');
  });

  it('gives every accessory a slot and a label, and every place a label', () => {
    expect(ACCESSORIES).toHaveLength(12);
    for (const a of ACCESSORIES) {
      expect(COMPANION_COPY.accessories[a]).toBeTruthy();
      if (a !== 'none') expect(['head', 'face', 'neck', 'back']).toContain(ACCESSORY_SLOT[a]);
    }
    for (const p of PLACEMENTS) expect(COMPANION_COPY.placements[p]).toBeTruthy();
  });

  it('has screen-reader words for all 14 expressions', () => {
    expect(EXPRESSIONS).toHaveLength(14);
    for (const e of EXPRESSIONS) expect(COMPANION_COPY.expressionWords[e]).toBeTruthy();
  });
});
