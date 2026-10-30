// Puts the chosen theme on the page: every color token as a CSS variable on
// <html>, plus data attributes for the font pairing, bold text, density,
// roundness and motion level (v2 spec 4.6.1). It returns the same values as a
// small object so the first-paint script in layout.tsx can replay them on
// the next visit before any JavaScript bundle loads.
import type { Settings } from '../types';
import type { MotionLevel } from '../motion/tokens';
import { QUADRANT_PALETTES, THEMES, tintAlpha, type Theme, type ThemeId, type ThemeTokens } from './themes';

const CSS_NAMES: Record<keyof ThemeTokens, string> = {
  bg: '--bg', surface: '--surface', surface2: '--surface-2', ink: '--ink', inkSoft: '--ink-soft',
  primary: '--primary', primaryShadow: '--primary-shadow', onPrimary: '--on-primary', line: '--line',
  focus: '--focus', notice: '--notice', accent: '--accent', accentShadow: '--accent-shadow',
  onAccent: '--on-accent', skyTop: '--sky-top', skyBottom: '--sky-bottom', sea: '--sea',
  seaDeep: '--sea-deep', foam: '--foam', sand: '--sand', sandShadow: '--sand-shadow',
};

export interface PaintedPrefs {
  vars: Record<string, string>;
  attrs: Record<string, string>;
  dark: boolean;
}

export function resolveThemeId(settings: Settings, systemDark: boolean): ThemeId {
  if (settings['appearance.followSystem']) {
    return systemDark ? settings['appearance.darkTheme'] : settings['appearance.lightTheme'];
  }
  return settings['appearance.theme'];
}

export function paintFor(settings: Settings, systemDark: boolean, motion: MotionLevel): PaintedPrefs {
  const theme: Theme = THEMES[resolveThemeId(settings, systemDark)] ?? THEMES.classic;
  const vars: Record<string, string> = {};
  for (const [token, cssName] of Object.entries(CSS_NAMES) as Array<[keyof ThemeTokens, string]>) {
    vars[cssName] = theme.tokens[token];
  }
  const colorblind = settings['appearance.quadrantPalette'] === 'colorblind';
  const palette = QUADRANT_PALETTES[colorblind ? 'colorblind' : theme.quadrants];
  for (const q of ['surge', 'swell', 'ebb', 'still'] as const) {
    vars[`--q-${q}`] = palette[q];
    vars[`--tint-${q}`] = `color-mix(in srgb, ${palette[q]} ${Math.round(tintAlpha(theme.scheme, q) * 100)}%, transparent)`;
  }
  vars['--text-scale'] = String(settings.textScale);

  const attrs: Record<string, string> = {
    theme: theme.id,
    themeGroup: theme.group,
    font: settings['appearance.font'],
    bold: String(settings['appearance.boldText']),
    density: settings['appearance.density'],
    roundness: settings['appearance.roundness'],
    // High-contrast themes and the color-blind palette add shape markers to
    // quadrant chips, so state never depends on color alone.
    shapes: String(settings['appearance.showQuadrantShapes'] || colorblind || theme.group === 'contrast'),
    spacing: settings.extraSpacing ? 'extra' : 'normal',
    motion,
    reduceMotion: String(motion === 'off'),
    pageTransitions: String(settings['motion.pageTransitions']),
    shoreWaves: String(settings['motion.shoreWaves']),
  };
  return { vars, attrs, dark: theme.scheme === 'dark' };
}

export function writePaint(root: HTMLElement, paint: PaintedPrefs): void {
  for (const [name, value] of Object.entries(paint.vars)) root.style.setProperty(name, value);
  for (const [name, value] of Object.entries(paint.attrs)) root.dataset[name] = value;
  root.classList.toggle('dark', paint.dark);
  root.style.colorScheme = paint.dark ? 'dark' : 'light';
}

// A theme change fades instead of snapping (250ms, spec 4.6.1): a sheet in
// the old background color sits on top and fades out. At motion Off it
// simply swaps.
export function crossfadeFrom(oldBg: string): void {
  if (typeof document === 'undefined' || !oldBg) return;
  const veil = document.createElement('div');
  veil.setAttribute('aria-hidden', 'true');
  veil.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;background:${oldBg};opacity:1;transition:opacity 250ms ease-out`;
  document.body.appendChild(veil);
  requestAnimationFrame(() => {
    veil.style.opacity = '0';
    window.setTimeout(() => veil.remove(), 300);
  });
}
