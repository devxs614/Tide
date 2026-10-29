// The three ambiences (v2 spec 6.2), each rendered once into a 10-second
// buffer that loops without a click: the last second is crossfaded into the
// first. Waves: low-passed noise that swells about every ten seconds. Rain:
// soft pinkish noise with scattered droplets. Brown: deep, steady noise.
import type { Ambience } from './names';

const SECONDS = 10;
const cache = new Map<string, AudioBuffer>();

function render(rate: number, kind: Exclude<Ambience, 'none'>): Float32Array {
  const n = rate * SECONDS;
  const data = new Float32Array(n);
  let brown = 0;
  let pink = 0;
  let low = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === 'brown') {
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown * 3.5;
    } else if (kind === 'rain') {
      pink = 0.97 * pink + 0.03 * white;
      data[i] = pink * 2.2 + white * 0.05;
    } else {
      // A one-pole low-pass, then a slow swell (one wave per loop).
      low = 0.985 * low + 0.015 * white;
      const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2);
      data[i] = low * 6 * swell;
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

export function makeAmbienceBuffer(ctx: AudioContext, kind: Exclude<Ambience, 'none'>): AudioBuffer {
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
