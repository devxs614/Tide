// The background sounds (v2 spec 6.2; v2.1 F-09, Appendix C), each rendered
// once into a 10-second buffer that loops without a click: the last second
// is crossfaded into the first. Waves, rain and brown are v2's, unchanged.
// v2.1 adds white, pink, fan and stream, and the noise beds under the two
// binaural sounds (whose tones are live oscillators in ambiencePlayer.ts).
import type { Ambience, AmbienceId } from './names';

const SECONDS = 10;
const cache = new Map<string, AudioBuffer>();

export type BufferKind = Exclude<Ambience, 'none'> | Exclude<AmbienceId, 'binaural_focus' | 'binaural_calm'>;

// A two-pole band-pass (RBJ's cookbook), run sample by sample while the
// buffer is rendered.
function bandpass(rate: number, freq: number, q: number) {
  const w = (2 * Math.PI * freq) / rate;
  const alpha = Math.sin(w) / (2 * q);
  const a0 = 1 + alpha;
  const [b0, b2, a1, a2] = [alpha / a0, -alpha / a0, (-2 * Math.cos(w)) / a0, (1 - alpha) / a0];
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x: number) => {
    const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
}

// A one-pole low-pass at roughly `freq`.
function lowpass(rate: number, freq: number) {
  const a = 1 - Math.exp((-2 * Math.PI * freq) / rate);
  let y = 0;
  return (x: number) => (y += a * (x - y));
}

function render(rate: number, kind: BufferKind): Float32Array {
  const n = rate * SECONDS;
  const data = new Float32Array(n);
  let brown = 0;
  let pink = 0;
  let low = 0;
  // Paul Kellet's pink-noise filter.
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  const lp9k = lowpass(rate, 9000);
  const lp500 = lowpass(rate, 500);
  const fanBand = bandpass(rate, 220, 0.5);
  const streamBand = bandpass(rate, 1800, 1.2);
  // The stream's level jumps to a new target every 40–90 ms and glides there.
  let target = 0.2, level = 0.2, nextStep = 0;
  const glide = 1 - Math.exp(-1 / (0.03 * rate));
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === 'brown') {
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown * 3.5;
    } else if (kind === 'rain') {
      pink = 0.97 * pink + 0.03 * white;
      data[i] = pink * 2.2 + white * 0.05;
    } else if (kind === 'waves') {
      // A one-pole low-pass, then a slow swell (one wave per loop).
      low = 0.985 * low + 0.015 * white;
      const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2);
      data[i] = low * 6 * swell;
    } else if (kind === 'white') {
      data[i] = lp9k(white) * 0.6;
    } else if (kind === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else if (kind === 'fan') {
      brown = (brown + 0.02 * white) / 1.02;
      // A faint 120 Hz hum that drifts half a hertz up and down.
      const hum = 0.015 * Math.sin(2 * Math.PI * (120 * i + 0.5 * Math.sin((2 * Math.PI * i) / n) * rate) / rate);
      data[i] = fanBand(lp500(brown * 3.5)) * 4 + hum * 4;
    } else {
      if (i >= nextStep) {
        target = 0.08 + Math.random() * 0.22;
        nextStep = i + Math.floor(rate * (0.04 + Math.random() * 0.05));
      }
      level += glide * (target - level);
      data[i] = streamBand(white) * level * 4;
    }
  }
  if (kind === 'rain') {
    // Droplets: short, high, quiet ticks at random moments.
    for (let d = 0; d < 140; d++) {
      const start = Math.floor(Math.random() * (n - rate * 0.02));
      for (let k = 0; k < rate * 0.015; k++) data[start + k] += (Math.random() * 2 - 1) * 0.18 * (1 - k / (rate * 0.015));
    }
  }
  // Crossfade the tail into the head so the loop point can't be heard.
  const fade = rate;
  for (let i = 0; i < fade; i++) {
    const t = i / fade;
    data[i] = data[i] * t + data[n - fade + i] * (1 - t);
  }
  return data.subarray(0, n - fade);
}

export function makeAmbienceBuffer(ctx: AudioContext, kind: BufferKind): AudioBuffer {
  const key = `${ctx.sampleRate}:${kind}`;
  let buffer = cache.get(key);
  if (!buffer) {
    const data = render(ctx.sampleRate, kind);
    buffer = ctx.createBuffer(1, data.length, ctx.sampleRate);
    buffer.getChannelData(0).set(data);
    cache.set(key, buffer);
  }
  return buffer;
}
