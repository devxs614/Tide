// Sounds of the shore (v2 spec 6.2): a drop when an item lands, a slow
// whoosh of a wave, and a cork pop with a glassy ring for bottles.
import { noise, tone, type SoundFn } from './kit';

export const waterDrop: SoundFn = (ctx, out, at) => {
  tone(ctx, out, { at, freq: 1200, to: 300, dur: 0.12, peak: 0.18 });
  noise(ctx, out, { at, dur: 0.02, filter: 'highpass', freq: 3000, peak: 0.05, attack: 0.002 });
};

export const wave: SoundFn = (ctx, out, at) =>
  noise(ctx, out, { at, dur: 1.2, filter: 'bandpass', freq: 700, q: 0.6, peak: 0.12, attack: 0.5 });

export const bottle: SoundFn = (ctx, out, at) => {
  noise(ctx, out, { at, dur: 0.05, filter: 'bandpass', freq: 1500, peak: 0.15, attack: 0.002 });
  tone(ctx, out, { at: at + 0.04, freq: 1800, dur: 0.3, peak: 0.08 });
};
