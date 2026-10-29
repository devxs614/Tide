// Small building blocks for Tide's synthesized sounds: a soft tone with a
// quick attack and a gentle decay, a burst of filtered noise, and a tiny
// reverb. Every sound in sounds/*.ts is a few of these, so nothing needs an
// audio file and nothing can be sharp: there are no square waves and every
// sound fades out.

export type SoundFn = (ctx: AudioContext, out: AudioNode, at: number) => void;

export function tone(
  ctx: AudioContext,
  out: AudioNode,
  opts: { at: number; freq: number; to?: number; dur: number; type?: OscillatorType; peak?: number; attack?: number },
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, opts.at);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, opts.at + opts.dur);
  const peak = opts.peak ?? 0.3;
  const attack = opts.attack ?? 0.005;
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(peak, opts.at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
  osc.connect(gain).connect(out);
  osc.start(opts.at);
  osc.stop(opts.at + opts.dur + 0.05);
}

const noiseCache = new WeakMap<AudioContext, AudioBuffer>();

export function noiseBuffer(ctx: AudioContext): AudioBuffer {
  let buffer = noiseCache.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseCache.set(ctx, buffer);
  }
  return buffer;
}

export function noise(
  ctx: AudioContext,
  out: AudioNode,
  opts: { at: number; dur: number; filter: BiquadFilterType; freq: number; q?: number; peak?: number; attack?: number },
): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = opts.filter;
  filter.frequency.value = opts.freq;
  filter.Q.value = opts.q ?? 0.8;
  const gain = ctx.createGain();
  const peak = opts.peak ?? 0.2;
  const attack = opts.attack ?? 0.01;
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(peak, opts.at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
  src.connect(filter).connect(gain).connect(out);
  src.start(opts.at);
  src.stop(opts.at + opts.dur + 0.05);
}

// A short, soft room made from decaying noise, for the chimes.
const reverbCache = new WeakMap<AudioContext, ConvolverNode>();

export function softReverb(ctx: AudioContext, out: AudioNode): AudioNode {
  let convolver = reverbCache.get(ctx);
  if (!convolver) {
    convolver = ctx.createConvolver();
    const length = Math.floor(ctx.sampleRate * 1.2);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
    convolver.buffer = impulse;
    reverbCache.set(ctx, convolver);
  }
  const wet = ctx.createGain();
  wet.gain.value = 0.25;
  convolver.connect(wet).connect(out);
  // Dry and wet both reach the output.
  const input = ctx.createGain();
  input.connect(out);
  input.connect(convolver);
  return input;
}

// Note frequencies used by the chimes.
export const NOTE = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5 };
