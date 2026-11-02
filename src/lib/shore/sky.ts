// The shore's sky by time of day (v2 spec 13.3): dawn around the start of
// Maya's day, golden hour before sunset, dusk after, night after that. The
// colors are CSS `color-mix` strings over the theme's own sky, so every
// theme gets its own dawn. Sunrise and sunset come from a small monthly
// table for Monterrey's latitude, approximate on purpose: it's a mood, not
// an almanac, and needs no network.
import type { Expression } from '@/lib/companion/registry';
import type { Settings } from '@/lib/types';
import { mixSky, TONES, type TimeOfDay } from './skyTone';

// v2.1 F-12 adds 'sunset' (the sun touching the horizon, with a warm
// reflection on the water), apart from v2's golden hour before it.
export type SkyPhase = 'dawn' | 'day' | 'golden' | 'sunset' | 'dusk' | 'night';

// Approximate local sunrise and sunset in Monterrey, in hours, per month.
const SUNRISE = [7.4, 7.25, 6.9, 6.5, 6.25, 6.15, 6.3, 6.5, 6.65, 6.8, 7.0, 7.3];
const SUNSET = [18.2, 18.5, 18.75, 19.0, 19.25, 19.4, 19.4, 19.15, 18.75, 18.35, 18.0, 18.0];


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
  if (h >= sunset - 1.5 && h < sunset - 0.25) return 'golden';
  if (h >= sunset - 0.25 && h < sunset + 0.25) return 'sunset';
  if (h >= sunset + 0.25 && h < sunset + 1) return 'dusk';
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
): { top: string; bottom: string; stars: boolean; reflection: boolean } {
  const theme = { top: 'var(--sky-top)', bottom: 'var(--sky-bottom)', stars: false, reflection: false };
  if (mode !== 'time' || phase === 'day') return theme;
  if (phase === 'night') {
    // Dark themes already have a night sky; light ones darken toward it.
    return darkTheme ? { ...theme, stars: true } : { ...theme, top: mixSky(theme.top, TONES.night, 70), bottom: mixSky(theme.bottom, TONES.night, 70), stars: true };
  }
  return { ...theme, top: mixSky(theme.top, TONES[phase], 35), bottom: mixSky(theme.bottom, TONES[phase], 55), reflection: phase === 'sunset' };
}

// v2.1 F-12: the scene for the person's choice; "auto" follows the clock.
export function scenePhase(choice: TimeOfDay, nowTs: number, dayStart: string): SkyPhase {
  return choice === 'auto' ? skyPhase(nowTs, dayStart) : choice;
}

// Where the sun or moon sits for a scene chosen by hand.
export function sunFor(phase: SkyPhase): { up: boolean; t: number } {
  const at: Record<SkyPhase, { up: boolean; t: number }> = {
    dawn: { up: true, t: 0.06 },
    day: { up: true, t: 0.5 },
    golden: { up: true, t: 0.85 },
    sunset: { up: true, t: 0.98 },
    dusk: { up: false, t: 0.1 },
    night: { up: false, t: 0.5 },
  };
  return at[phase];
}

// The companion matches the hour: asleep at night, waking at dawn,
// sitting quietly as the sun goes down.
export function companionPose(phase: SkyPhase): Expression {
  if (phase === 'night') return 'sleeping';
  if (phase === 'dawn') return 'sleepy';
  if (phase === 'sunset' || phase === 'dusk') return 'calm';
  return 'idle';
}
