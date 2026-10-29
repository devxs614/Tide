// The quiet interface sounds (v2 spec 6.2): a soft wooden tick for primary
// buttons, a two-step click for switches, a small bubble pop for chips and
// cards. All very quiet; they confirm a touch, they don't announce it.
import { tone, type SoundFn } from './kit';

export const tap: SoundFn = (ctx, out, at) => tone(ctx, out, { at, freq: 520, dur: 0.035, peak: 0.12 });

export const toggle: SoundFn = (ctx, out, at) => {
  tone(ctx, out, { at, freq: 440, dur: 0.03, peak: 0.12 });
  tone(ctx, out, { at: at + 0.035, freq: 660, dur: 0.03, peak: 0.12 });
};

export const select: SoundFn = (ctx, out, at) => tone(ctx, out, { at, freq: 900, to: 500, dur: 0.06, peak: 0.15 });
