// Tide's 15 themes (v2 spec 4.6.2). Each one defines every color token, and
// applyTheme.ts writes them onto <html> as CSS variables, so components only
// ever say `bg-surface` or `text-ink`. Classic and Classic Dark are the v1
// look, kept exactly so existing users see no change until they choose one.
// Names and descriptions live in copy (copy.themes); these are just colors.

export type ThemeId =
  | 'lagoon'
  | 'oceanBlue'
  | 'coralReef'
  | 'bubblegum'
  | 'kelpForest'
  | 'sunsetShore'
  | 'lavenderMist'
  | 'sandbar'
  | 'classic'
  | 'midnightTide'
  | 'deepSea'
  | 'aurora'
  | 'classicDark'
  | 'pearl'
  | 'ink';

export type ThemeGroup = 'light' | 'dark' | 'contrast';
export type QuadrantPaletteId = 'standard' | 'night' | 'muted' | 'colorblind';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  primary: string;
  primaryShadow: string;
  onPrimary: string;
  line: string;
  focus: string;
  notice: string;
  accent: string;
  accentShadow: string;
  onAccent: string;
  skyTop: string;
  skyBottom: string;
  sea: string;
  seaDeep: string;
  foam: string;
  sand: string;
  sandShadow: string;
}

export interface Theme {
  id: ThemeId;
  group: ThemeGroup;
  // Whether the theme reads as light or dark, for `color-scheme` and the
  // `.dark` class. High-contrast themes come in one of each.
  scheme: 'light' | 'dark';
  quadrants: QuadrantPaletteId;
  tokens: ThemeTokens;
}

const t = (tokens: ThemeTokens) => tokens;

export const THEMES: Record<ThemeId, Theme> = {
  lagoon: {
    id: 'lagoon', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#F4F8F7', surface: '#FFFFFF', surface2: '#E6F0EE', ink: '#17313A', inkSoft: '#4E6670',
      primary: '#1F7A80', primaryShadow: '#155A5E', onPrimary: '#FFFFFF', line: '#D3E2DF',
      focus: '#1F7A80', notice: '#7A5E12', accent: '#F2A65A', accentShadow: '#C98236', onAccent: '#2B1A08',
      skyTop: '#BDE7F0', skyBottom: '#F4F8F7', sea: '#5FB8C2', seaDeep: '#2E8A96', foam: '#FFFFFF',
      sand: '#F2DFB8', sandShadow: '#DFC79A',
    }),
  },
  oceanBlue: {
    id: 'oceanBlue', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#F2F7FD', surface: '#FFFFFF', surface2: '#E2EDFA', ink: '#13263D', inkSoft: '#4A5F78',
      primary: '#1F5FBF', primaryShadow: '#164890', onPrimary: '#FFFFFF', line: '#D2E0F2',
      focus: '#1F5FBF', notice: '#7A5A12', accent: '#FF9F5A', accentShadow: '#D97A36', onAccent: '#2B1405',
      skyTop: '#A9D4FF', skyBottom: '#EAF4FF', sea: '#3D8BEA', seaDeep: '#1F5FBF', foam: '#FFFFFF',
      sand: '#F4E2C0', sandShadow: '#E0CA9F',
    }),
  },
  coralReef: {
    id: 'coralReef', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#FFF5F2', surface: '#FFFFFF', surface2: '#FFE6DF', ink: '#3A1F24', inkSoft: '#75545A',
      primary: '#B8405A', primaryShadow: '#8E2E44', onPrimary: '#FFFFFF', line: '#F5D5CD',
      focus: '#B8405A', notice: '#7E5A10', accent: '#26837C', accentShadow: '#175954', onAccent: '#FFFFFF', // accent darkened for AA (D61)
      skyTop: '#FFD3C7', skyBottom: '#FFF5F2', sea: '#6CC4C9', seaDeep: '#3C9AA3', foam: '#FFFFFF',
      sand: '#F7DDB8', sandShadow: '#E8C796',
    }),
  },
  bubblegum: {
    id: 'bubblegum', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#FFF4FA', surface: '#FFFFFF', surface2: '#FCE3F1', ink: '#3B1D33', inkSoft: '#6E4F65',
      primary: '#B83C8A', primaryShadow: '#8A2C67', onPrimary: '#FFFFFF', line: '#F3D3E6',
      focus: '#B83C8A', notice: '#7A5512', accent: '#6C8CFF', accentShadow: '#4A66D6', onAccent: '#0E1640',
      skyTop: '#FFD6EC', skyBottom: '#FFF4FA', sea: '#8FC9F2', seaDeep: '#5A9FD6', foam: '#FFFFFF',
      sand: '#FBE3C8', sandShadow: '#EBC9A6',
    }),
  },
  kelpForest: {
    id: 'kelpForest', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#F3F7F0', surface: '#FFFFFF', surface2: '#E3EEDC', ink: '#1E2E1E', inkSoft: '#526552',
      primary: '#3C7A3A', primaryShadow: '#2A5A28', onPrimary: '#FFFFFF', line: '#D3E2CB',
      focus: '#3C7A3A', notice: '#7A5E12', accent: '#E9B949', accentShadow: '#BF922A', onAccent: '#2A1F05',
      skyTop: '#CFEBD6', skyBottom: '#F3F7F0', sea: '#4FA59A', seaDeep: '#2D7A70', foam: '#F7FFFB',
      sand: '#E9DDB7', sandShadow: '#D4C493',
    }),
  },
  sunsetShore: {
    id: 'sunsetShore', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#FFF7EE', surface: '#FFFFFF', surface2: '#FDE8D2', ink: '#3A2617', inkSoft: '#6E5643',
      primary: '#B4531F', primaryShadow: '#87401A', onPrimary: '#FFFFFF', line: '#F2DCC4',
      focus: '#B4531F', notice: '#6F5A12', accent: '#4B72D2', accentShadow: '#3A56A0', onAccent: '#FFFFFF', // accent darkened for AA (D61)
      skyTop: '#FFB98F', skyBottom: '#FFE6CF', sea: '#6A9FD6', seaDeep: '#3F6FAF', foam: '#FFF8F0',
      sand: '#F6D7A8', sandShadow: '#E4BD83',
    }),
  },
  lavenderMist: {
    id: 'lavenderMist', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      bg: '#F7F5FC', surface: '#FFFFFF', surface2: '#ECE7F8', ink: '#2A2440', inkSoft: '#615A7A',
      primary: '#6A4FB8', primaryShadow: '#4E3A8C', onPrimary: '#FFFFFF', line: '#DDD5F0',
      focus: '#6A4FB8', notice: '#725A14', accent: '#E58FB0', accentShadow: '#BF6A8B', onAccent: '#3A1426',
      skyTop: '#DCD3F7', skyBottom: '#F7F5FC', sea: '#8EA6E8', seaDeep: '#6177C4', foam: '#FFFFFF',
      sand: '#EFE0CC', sandShadow: '#DCC8AE',
    }),
  },
  sandbar: {
    id: 'sandbar', group: 'light', scheme: 'light', quadrants: 'muted',
    tokens: t({
      bg: '#F5F1EA', surface: '#FBF9F5', surface2: '#ECE5D9', ink: '#2E2A24', inkSoft: '#625B50',
      primary: '#5E6B5A', primaryShadow: '#454F42', onPrimary: '#FFFFFF', line: '#DDD4C5',
      focus: '#4B5648', notice: '#6B5A2E', accent: '#B08D57', accentShadow: '#8A6C3E', onAccent: '#231A0C',
      skyTop: '#E6E1D6', skyBottom: '#F5F1EA', sea: '#9DB2AE', seaDeep: '#7A918C', foam: '#FBF9F5',
      sand: '#E8DCC6', sandShadow: '#D6C8AE',
    }),
  },
  classic: {
    id: 'classic', group: 'light', scheme: 'light', quadrants: 'standard',
    tokens: t({
      // notice is the v1 code's #80651C (D52), not the older #8A6D1F (D61).
      bg: '#F7F5F0', surface: '#FFFFFF', surface2: '#F0EDE6', ink: '#1F2A33', inkSoft: '#5B6770',
      primary: '#1F5C63', primaryShadow: '#143E43', onPrimary: '#FFFFFF', line: '#E2DED6',
      focus: '#1F5C63', notice: '#80651C', accent: '#E8836A', accentShadow: '#B9614B', onAccent: '#2B140D',
      skyTop: '#C9E4EA', skyBottom: '#F7F5F0', sea: '#6FA8B0', seaDeep: '#3F7A83', foam: '#FFFFFF',
      sand: '#EBDDC3', sandShadow: '#D6C5A5',
    }),
  },
  midnightTide: {
    id: 'midnightTide', group: 'dark', scheme: 'dark', quadrants: 'night',
    tokens: t({
      bg: '#0E1A24', surface: '#152532', surface2: '#1C3141', ink: '#E6F1F5', inkSoft: '#9DB4BF',
      primary: '#4FC3C9', primaryShadow: '#2B8E94', onPrimary: '#08222A', line: '#24394A',
      focus: '#8FE3E7', notice: '#E8C46A', accent: '#F5B971', accentShadow: '#C48D4A', onAccent: '#2A1A06',
      skyTop: '#0B1530', skyBottom: '#1B2F4A', sea: '#1F4E6B', seaDeep: '#12324A', foam: '#9FD9E6',
      sand: '#8C7A5A', sandShadow: '#6F5F44',
    }),
  },
  deepSea: {
    id: 'deepSea', group: 'dark', scheme: 'dark', quadrants: 'night',
    tokens: t({
      bg: '#0F1030', surface: '#181A42', surface2: '#22255A', ink: '#ECEBFF', inkSoft: '#A9A8D6',
      primary: '#8C8CFF', primaryShadow: '#5A5AD1', onPrimary: '#0F1030', line: '#2C2F66',
      focus: '#C2C2FF', notice: '#E8C46A', accent: '#5EE0C8', accentShadow: '#36B39C', onAccent: '#06231D',
      skyTop: '#080926', skyBottom: '#1E2160', sea: '#26307A', seaDeep: '#161C52', foam: '#9AA4FF',
      sand: '#6E6690', sandShadow: '#575073',
    }),
  },
  aurora: {
    id: 'aurora', group: 'dark', scheme: 'dark', quadrants: 'night',
    tokens: t({
      bg: '#10141A', surface: '#171D25', surface2: '#1F2731', ink: '#EAF2F0', inkSoft: '#A3B3B0',
      primary: '#5EE0B0', primaryShadow: '#2FA97E', onPrimary: '#0B1F17', line: '#283240',
      focus: '#9CF2D2', notice: '#E8C46A', accent: '#B58CFF', accentShadow: '#8A62D6', onAccent: '#170A33',
      skyTop: '#0A1A1F', skyBottom: '#1C2A3A', sea: '#1E4A4F', seaDeep: '#12302F', foam: '#8FF0D0',
      sand: '#7A7466', sandShadow: '#5E594E',
    }),
  },
  classicDark: {
    id: 'classicDark', group: 'dark', scheme: 'dark', quadrants: 'night',
    tokens: t({
      bg: '#12181C', surface: '#1B2328', surface2: '#222B31', ink: '#E8ECEF', inkSoft: '#A3AEB6',
      primary: '#6FB8BF', primaryShadow: '#4A8A90', onPrimary: '#12181C', line: '#2A343A',
      focus: '#9AD6DC', notice: '#E5C46B', accent: '#E8836A', accentShadow: '#B9614B', onAccent: '#2B140D',
      skyTop: '#0F1A20', skyBottom: '#1B2A33', sea: '#2D5560', seaDeep: '#1C3A42', foam: '#A8D8DE',
      sand: '#7D735F', sandShadow: '#605847',
    }),
  },
  pearl: {
    id: 'pearl', group: 'contrast', scheme: 'light', quadrants: 'colorblind',
    tokens: t({
      bg: '#FFFFFF', surface: '#FFFFFF', surface2: '#F2F2F2', ink: '#000000', inkSoft: '#2B2B2B',
      primary: '#003F8C', primaryShadow: '#00265A', onPrimary: '#FFFFFF', line: '#000000',
      focus: '#000000', notice: '#5C4300', accent: '#8C3A00', accentShadow: '#5E2700', onAccent: '#FFFFFF',
      skyTop: '#D9ECFF', skyBottom: '#FFFFFF', sea: '#0050B3', seaDeep: '#003F8C', foam: '#FFFFFF',
      sand: '#F2E2C2', sandShadow: '#8C7A57',
    }),
  },
  ink: {
    id: 'ink', group: 'contrast', scheme: 'dark', quadrants: 'colorblind',
    tokens: t({
      bg: '#000000', surface: '#0A0A0A', surface2: '#1A1A1A', ink: '#FFFFFF', inkSoft: '#E6E6E6',
      primary: '#FFD84D', primaryShadow: '#C9A100', onPrimary: '#000000', line: '#FFFFFF',
      focus: '#FFFFFF', notice: '#FFD84D', accent: '#7FE7FF', accentShadow: '#3FB6CC', onAccent: '#000000',
      skyTop: '#000000', skyBottom: '#0A1A2A', sea: '#0A3A66', seaDeep: '#062645', foam: '#FFFFFF',
      sand: '#5A4E36', sandShadow: '#3D3524',
    }),
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

// Quadrant colors per palette (spec 4.6.3). The names always appear in text
// next to them; the colors are never the only signal.
export const QUADRANT_PALETTES: Record<QuadrantPaletteId, Record<'surge' | 'swell' | 'ebb' | 'still', string>> = {
  standard: { surge: '#E8836A', swell: '#F0B64C', ebb: '#6E8DAF', still: '#7DB59F' },
  night: { surge: '#F09A82', swell: '#F5C66A', ebb: '#8FAACB', still: '#95C9B3' },
  muted: { surge: '#C99383', swell: '#CDB27A', ebb: '#8C9DAE', still: '#93AE9F' },
  colorblind: { surge: '#D55E00', swell: '#E69F00', ebb: '#0072B2', still: '#009E73' },
};

// How strong the quadrant tints are: light surfaces need less color to read
// as a tint than dark ones. Surge and Ebb are a little lighter than Swell
// and Still on light themes, as in v1.
export function tintAlpha(scheme: 'light' | 'dark', quadrant: 'surge' | 'swell' | 'ebb' | 'still'): number {
  if (scheme === 'dark') return 0.24;
  return quadrant === 'surge' || quadrant === 'ebb' ? 0.16 : 0.18;
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in THEMES;
}
