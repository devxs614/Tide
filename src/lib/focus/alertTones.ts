// The focus alert sounds (v2.1 spec Appendix C), synthesized with Web Audio
// so there are no files to load. Each recipe starts its nodes at `when` on
// the audio clock and returns them, so a pause can stop them before they
// sound. Peaks are low on purpose; a limiter sits after them anyway.
export type EndTone = 'chime' | 'bell' | 'marimba' | 'waves' | 'rise';
export type AlertTone = EndTone | 'warning' | 'nudge';
type Recipe = (ctx: AudioContext, out: AudioNode, when: number) => AudioScheduledSourceNode[];

interface NoteShape {
  type?: OscillatorType;
  attack: number;
  decay: number;
  peak: number;
}

// One note: a quick rise, then an exponential fall to silence.
function note(ctx: AudioContext, out: AudioNode, freq: number, when: number, shape: NoteShape): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = shape.type ?? 'sine';
  osc.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(shape.peak, when + shape.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + shape.attack + shape.decay);
  osc.connect(gain).connect(out);
  osc.start(when);
  osc.stop(when + shape.attack + shape.decay + 0.05);
  return osc;
}

// A small generated room: 1.2 s of decaying noise as the impulse.
function reverb(ctx: AudioContext, out: AudioNode, wet: number): AudioNode {
  const length = Math.floor(ctx.sampleRate * 1.2);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.5;
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  const wetGain = ctx.createGain();
  wetGain.gain.value = wet;
  const input = ctx.createGain();
  input.connect(out);
  input.connect(convolver).connect(wetGain).connect(out);
  return input;
}

function pinkNoise(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2;
  }
  return buffer;
}

const chime: Recipe = (ctx, out, when) => {
  const room = reverb(ctx, out, 0.2);
  return [659, 988].map((f, i) => note(ctx, room, f, when + i * 0.12, { type: 'triangle', attack: 0.005, decay: 1.4, peak: 0.35 }));
};

const bell: Recipe = (ctx, out, when) =>
  [
    [1, 1, 2.5],
    [2, 0.4, 1.6],
    [2.76, 0.25, 1.0],
    [5.4, 0.1, 0.6],
  ].map(([ratio, gain, decay]) => note(ctx, out, 523 * ratio, when, { attack: 0.004, decay, peak: 0.3 * gain }));

const marimba: Recipe = (ctx, out, when) =>
  [440, 554, 659].flatMap((f, i) => [
    note(ctx, out, f, when + i * 0.11, { attack: 0.002, decay: 0.5, peak: 0.3 }),
    // The brief high partial is the "wood" click.
    note(ctx, out, f * 4, when + i * 0.11, { attack: 0.002, decay: 0.05, peak: 0.08 }),
  ]);

const waves: Recipe = (ctx, out, when) => {
  const source = ctx.createBufferSource();
  source.buffer = pinkNoise(ctx, 3);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, when);
  filter.frequency.exponentialRampToValueAtTime(1600, when + 1.5);
  filter.frequency.exponentialRampToValueAtTime(300, when + 3);
  const swell = ctx.createGain();
  swell.gain.setValueAtTime(0.0001, when);
  swell.gain.linearRampToValueAtTime(0.3, when + 1.5);
  swell.gain.linearRampToValueAtTime(0.0001, when + 3);
  source.connect(filter).connect(swell).connect(out);
  source.start(when);
  source.stop(when + 3.05);
  return [source, note(ctx, out, 659, when + 2.6, { type: 'triangle', attack: 0.005, decay: 1.4, peak: 0.3 })];
};

// The gentlest: a soft pad that grows over six seconds, then lets go.
const rise: Recipe = (ctx, out, when) =>
  [
    [440, 1],
    [659, 0.5],
  ].map(([f, level]) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = f;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01 * level, when);
    gain.gain.exponentialRampToValueAtTime(0.3 * level, when + 6);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 7.5);
    osc.connect(gain).connect(out);
    osc.start(when);
    osc.stop(when + 7.6);
    return osc;
  });

const warning: Recipe = (ctx, out, when) => [note(ctx, out, 494, when, { attack: 0.01, decay: 0.8, peak: 0.15 })];

const nudge: Recipe = (ctx, out, when) =>
  [392, 523].map((f, i) => note(ctx, out, f, when + i * 0.15, { attack: 0.01, decay: 0.6, peak: 0.18 }));

export const TONES: Record<AlertTone, Recipe> = { chime, bell, marimba, waves, rise, warning, nudge };
