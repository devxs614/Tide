// Each companion's little "voice" (v2 spec 6.2). These are sounds, not
// speech: two squeaks for Pebble the otter, a bloop for Lolo the axolotl, a
// low hum for Capi, a tiny chirp for Zip, a glassy shimmer for Luma and a
// double click for Shelby.
import { noise, tone, type SoundFn } from './kit';

export const chirpOtter: SoundFn = (ctx, out, at) => {
  tone(ctx, out, { at, freq: 1100, to: 1500, dur: 0.07, peak: 0.12 });
  tone(ctx, out, { at: at + 0.1, freq: 1200, to: 1700, dur: 0.07, peak: 0.12 });
};
export const chirpAxolotl: SoundFn = (ctx, out, at) => tone(ctx, out, { at, freq: 380, to: 620, dur: 0.14, peak: 0.16 });
export const chirpCapybara: SoundFn = (ctx, out, at) =>
  tone(ctx, out, { at, freq: 150, dur: 0.35, type: 'triangle', peak: 0.16, attack: 0.08 });
export const chirpGecko: SoundFn = (ctx, out, at) => tone(ctx, out, { at, freq: 2200, to: 2800, dur: 0.05, peak: 0.08 });
export const chirpJellyfish: SoundFn = (ctx, out, at) => {
  tone(ctx, out, { at, freq: 1568, dur: 0.5, peak: 0.05, attack: 0.1 });
  noise(ctx, out, { at, dur: 0.5, filter: 'highpass', freq: 6000, peak: 0.02, attack: 0.15 });
};
export const chirpHermitCrab: SoundFn = (ctx, out, at) => {
  noise(ctx, out, { at, dur: 0.02, filter: 'bandpass', freq: 2500, q: 4, peak: 0.12, attack: 0.002 });
  noise(ctx, out, { at: at + 0.08, dur: 0.02, filter: 'bandpass', freq: 2500, q: 4, peak: 0.12, attack: 0.002 });
};
