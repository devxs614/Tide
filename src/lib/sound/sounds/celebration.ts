// Chimes for things worth marking (v2 spec 6.2): a warm two-note "success",
// a rising three-note arpeggio, and the arpeggio with a soft shimmer for big
// moments. Triangle and sine only, through a small reverb, so even the big
// one is round rather than bright.
import { NOTE, noise, softReverb, tone, type SoundFn } from './kit';

export const success: SoundFn = (ctx, out, at) => {
  const room = softReverb(ctx, out);
  tone(ctx, room, { at, freq: NOTE.C5, dur: 0.12, type: 'triangle', peak: 0.2 });
  tone(ctx, room, { at: at + 0.12, freq: NOTE.E5, dur: 0.22, type: 'triangle', peak: 0.2 });
};

export const celebrateSmall: SoundFn = (ctx, out, at) => {
  const room = softReverb(ctx, out);
  [NOTE.C5, NOTE.E5, NOTE.G5].forEach((freq, i) => {
    tone(ctx, room, { at: at + i * 0.09, freq, dur: 0.2, type: 'triangle', peak: 0.16 });
    tone(ctx, room, { at: at + i * 0.09, freq, dur: 0.2, peak: 0.08 });
  });
};

export const celebrateBig: SoundFn = (ctx, out, at) => {
  const room = softReverb(ctx, out);
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((freq, i) => {
    tone(ctx, room, { at: at + i * 0.09, freq, dur: 0.3, type: 'triangle', peak: 0.16 });
  });
  noise(ctx, room, { at: at + 0.3, dur: 0.4, filter: 'highpass', freq: 7000, peak: 0.04, attack: 0.05 });
};
