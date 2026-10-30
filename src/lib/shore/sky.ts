// The shore's sky by time of day (v2 spec 13.3): dawn around the start of
// Maya's day, golden hour before sunset, dusk after, night after that. The
// colors are CSS `color-mix` strings over the theme's own sky, so every
// theme gets its own dawn. Sunrise and sunset come from a small monthly
// table for Monterrey's latitude, approximate on purpose: it's a mood, not
// an almanac, and needs no network.
import type { Settings } from '@/lib/types';

export type SkyPhase = 'dawn' | 'day' | 'golden' | 'dusk' | 'night';

// Approximate local sunrise and sunset in Monterrey, in hours, per month.
const SUNRISE = [7.4, 7.25, 6.9, 6.5, 6.25, 6.15, 6.3, 6.5, 6.65, 6.8, 7.0, 7.3];
const SUNSET = [18.2, 18.5, 18.75, 19.0, 19.25, 19.4, 19.4, 19.15, 18.75, 18.35, 18.0, 18.0];

const DAWN = '#FFD1B3';
const GOLDEN = '#FFC27A';
const DUSK = '#9C7BD1';
const NIGHT = '#0E1A2E';

function hours(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + (m || 0) / 60;
}

export function skyPhase(nowTs: number, dayStart: string): SkyPhase {
  const d = new Date(nowTs);
  const h = d.getHours() + d.getMinutes() / 60;
  const sunset = SUNSET[d.getMonth()];
  const start = hours(dayStart);
  if (Math.abs(h - start) <= 1) return 'dawn';
  if (h >= sunset - 1.5 && h < sunset) return 'golden';
  if (h >= sunset && h < sunset + 1) return 'dusk';
  if (h >= sunset + 1 || h < Math.min(start - 1, SUNRISE[d.getMonth()])) return 'night';
  return 'day';
}

// Where the sun (or moon) sits on its arc, 0 at the left edge to 1 at the
// right. The moon crosses the sky through the night.
export function sunProgress(nowTs: number): { up: boolean; t: number } {
  const d = new Date(nowTs);
  const h = d.getHours() + d.getMinutes() / 60;
  const rise = SUNRISE[d.getMonth()];
  const set = SUNSET[d.getMonth()];
  if (h >= rise && h <= set) return { up: true, t: (h - rise) / (set - rise) };
  const night = 24 - set + rise;
  const into = h > set ? h - set : h + 24 - set;
  return { up: false, t: Math.min(1, into / night) };
}

export function skyColors(
  mode: Settings['shore.sky'],
  phase: SkyPhase,
  darkTheme: boolean,
): { top: string; bottom: string; stars: boolean } {
  const theme = { top: 'var(--sky-top)', bottom: 'var(--sky-bottom)', stars: false };
  if (mode !== 'time' || phase === 'day') return theme;
  const mix = (base: string, toward: string, pct: number) => `color-mix(in srgb, ${base} ${100 - pct}%, ${toward})`;
  if (phase === 'night') {
    // Dark themes already have a night sky; light ones darken toward it.
    return darkTheme ? { ...theme, stars: true } : { top: mix(theme.top, NIGHT, 70), bottom: mix(theme.bottom, NIGHT, 70), stars: true };
  }
  const toward = phase === 'dawn' ? DAWN : phase === 'golden' ? GOLDEN : DUSK;
  return { top: mix(theme.top, toward, 35), bottom: mix(theme.bottom, toward, 55), stars: false };
}
