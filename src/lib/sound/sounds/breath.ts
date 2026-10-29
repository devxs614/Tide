// Breathing cues and the end of a focus block (v2 spec 6.2): very soft
// filtered noise that rises over four seconds and falls over four, and a
// low bell with a long tail that says "time's up" without startling.
import { noise, tone, type SoundFn } from './kit';

export const breathIn: SoundFn = (ctx, out, at) =>
  noise(ctx, out, { at, dur: 4, filter: 'lowpass', freq: 900, peak: 0.06, attack: 3.5 });
export const breathOut: SoundFn = (ctx, out, at) =>
  noise(ctx, out, { at, dur: 4, filter: 'lowpass', freq: 700, peak: 0.06, attack: 0.3 });
export const focusEnd: SoundFn = (ctx, out, at) => tone(ctx, out, { at, freq: 660, dur: 2, peak: 0.12, attack: 0.01 });
