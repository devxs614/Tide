// Every theme has to be readable (v2 spec 4.6.4): text on backgrounds,
// buttons, links, focus rings and quadrant tints all meet WCAG AA. Classic
// and Classic Dark must stay exactly the v1 colors.
import { describe, expect, it } from 'vitest';
import { composite, contrastRatio } from '../contrast';
import { QUADRANT_PALETTES, THEMES, THEME_IDS, tintAlpha, type ThemeTokens } from '../themes';

const TOKEN_NAMES: Array<keyof ThemeTokens> = [
  'bg', 'surface', 'surface2', 'ink', 'inkSoft', 'primary', 'primaryShadow', 'onPrimary', 'line', 'focus',
  'notice', 'accent', 'accentShadow', 'onAccent', 'skyTop', 'skyBottom', 'sea', 'seaDeep', 'foam', 'sand', 'sandShadow',
];

describe.each(THEME_IDS)('theme %s', (id) => {
  const theme = THEMES[id];
  const c = theme.tokens;

  it('defines every token as a 6-digit hex color', () => {
    for (const name of TOKEN_NAMES) expect(c[name], name).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('keeps text readable', () => {
    for (const bg of [c.bg, c.surface, c.surface2]) expect(contrastRatio(c.ink, bg)).toBeGreaterThanOrEqual(4.5);
    for (const bg of [c.bg, c.surface]) expect(contrastRatio(c.inkSoft, bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onPrimary, c.primary), 'onPrimary on primary').toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onAccent, c.accent), 'onAccent on accent').toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.primary, c.surface), 'primary as link text').toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.focus, c.bg), 'focus ring').toBeGreaterThanOrEqual(3);
  });

  it('keeps text readable on every quadrant tint', () => {
    const palette = QUADRANT_PALETTES[theme.quadrants];
    for (const q of ['surge', 'swell', 'ebb', 'still'] as const) {
      const tint = composite(palette[q], tintAlpha(theme.scheme, q), c.surface);
      expect(contrastRatio(c.ink, tint), q).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('classic themes', () => {
  it('match the v1 colors', () => {
    expect(THEMES.classic.tokens).toMatchObject({
      bg: '#F7F5F0', surface: '#FFFFFF', surface2: '#F0EDE6', ink: '#1F2A33', inkSoft: '#5B6770',
      primary: '#1F5C63', onPrimary: '#FFFFFF', line: '#E2DED6', focus: '#1F5C63', notice: '#80651C',
    });
    expect(THEMES.classicDark.tokens).toMatchObject({
      bg: '#12181C', surface: '#1B2328', surface2: '#222B31', ink: '#E8ECEF', inkSoft: '#A3AEB6',
      primary: '#6FB8BF', onPrimary: '#12181C', line: '#2A343A', focus: '#9AD6DC', notice: '#E5C46B',
    });
    expect(QUADRANT_PALETTES.standard).toEqual({ surge: '#E8836A', swell: '#F0B64C', ebb: '#6E8DAF', still: '#7DB59F' });
  });
});
