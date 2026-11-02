// The tones the shore's sky leans toward at each time of day (v2 spec
// 13.3; v2.1 F-12), and the sky for a time chosen by hand. Kept tiny and
// apart from sky.ts, so Today's shore strip can follow the choice without
// loading the sunrise tables.
export type TimeOfDay = 'auto' | 'dawn' | 'day' | 'sunset' | 'dusk' | 'night';

export const TONES = { dawn: '#FFD1B3', golden: '#FFC27A', sunset: '#FFB070', dusk: '#9C7BD1', night: '#0E1A2E' };

export const mixSky = (base: string, toward: string, pct: number) => `color-mix(in srgb, ${base} ${100 - pct}%, ${toward})`;

// The bottom of the sky for a chosen time, or null for "auto" (the strip
// then keeps the theme's own sky, as in v2).
export function chosenSkyBottom(choice: TimeOfDay, darkTheme: boolean): string | null {
  const base = 'var(--sky-bottom)';
  if (choice === 'auto' || choice === 'day') return null;
  if (choice === 'night') return darkTheme ? null : mixSky(base, TONES.night, 70);
  return mixSky(base, TONES[choice], 55);
}
