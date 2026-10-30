// Every species draws every expression (v2 spec 8.4, 21.2), in every color,
// wearing each accessory in the right slot. Rendering the drawings directly
// keeps this fast; the figure wrapper has its own test below.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { ACCESSORIES, COMPANIONS, EXPRESSIONS, SPECIES, type CompanionSpecies } from '@/lib/companion/registry';
import { renderApp, resetApp } from '@/test/utils';
import CompanionFigure from '../CompanionFigure';
import { AxolotlArt } from '../species/Axolotl';
import { CapybaraArt } from '../species/Capybara';
import { GeckoArt } from '../species/Gecko';
import { HermitCrabArt } from '../species/HermitCrab';
import { JellyfishArt } from '../species/Jellyfish';
import { OtterArt } from '../species/Otter';
import type { SpeciesArtProps } from '../species/types';

const ART: Record<CompanionSpecies, ComponentType<SpeciesArtProps>> = {
  otter: OtterArt,
  axolotl: AxolotlArt,
  capybara: CapybaraArt,
  gecko: GeckoArt,
  jellyfish: JellyfishArt,
  hermit_crab: HermitCrabArt,
};

function draw(species: CompanionSpecies, props: Partial<SpeciesArtProps> = {}) {
  const Art = ART[species];
  const colors = COMPANIONS[species].variants[0];
  return render(
    <svg viewBox="0 0 200 200">
      <Art colors={colors} expression="idle" eyesClosed={false} accessory="none" faceStyle="dots" glow={{ color: colors.accent, strength: 1 }} {...props} />
    </svg>,
  );
}

describe('companion drawings', () => {
  it.each(SPECIES)('%s draws a face for all 14 expressions', (species) => {
    for (const expression of EXPRESSIONS) {
      const { container, unmount } = draw(species, { expression });
      expect(container.querySelector('[data-part="eyes"]'), `${species} ${expression}`).not.toBeNull();
      expect(container.querySelector('[data-part="mouth"]'), `${species} ${expression}`).not.toBeNull();
      unmount();
    }
  });

  it.each(SPECIES)('%s draws in all four colors', (species) => {
    for (const colors of COMPANIONS[species].variants) {
      const { container, unmount } = draw(species, { colors });
      expect(container.innerHTML).toContain(colors.main);
      unmount();
    }
  });

  it.each(SPECIES)('%s wears each accessory exactly once', (species) => {
    for (const accessory of ACCESSORIES.filter((a) => a !== 'none')) {
      const { container, unmount } = draw(species, { accessory });
      // The backpack has a back layer (the pack) and a front one (straps).
      const expected = accessory === 'backpack' ? 2 : 1;
      expect(container.querySelectorAll(`[data-part="accessory-${accessory}"]`), `${species} ${accessory}`).toHaveLength(expected);
      unmount();
    }
  });

  it('lets Luma go without a face', () => {
    const { container } = draw('jellyfish', { faceStyle: 'none' });
    expect(container.querySelector('[data-part="eyes"]')).toBeNull();
  });
});

describe('the companion figure', () => {
  it('names the companion and its mood for screen readers, and exposes the expression', async () => {
    await resetApp();
    await renderApp(<CompanionFigure species="axolotl" name="Lolo" variant="" accessory="none" expression="curious" size={88} level="calm" />);
    const figure = await screen.findByRole('img', { name: 'Lolo the axolotl, looking curious' });
    expect(figure).toHaveAttribute('data-expression', 'curious');
    expect(figure).toHaveAttribute('data-level', 'calm');
  });

  it('holds still at motion Off: no reaction attribute', async () => {
    await resetApp();
    await renderApp(<CompanionFigure species="otter" name="Pebble" variant="" accessory="none" expression="happy" size={88} level="off" reaction="hop" reactionKey={1} />);
    const figure = await screen.findByRole('img', { name: /Pebble/ });
    expect(figure).not.toHaveAttribute('data-reaction');
  });
});
