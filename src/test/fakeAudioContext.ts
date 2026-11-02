// A stand-in AudioContext for tests (v2.1): records oscillator frequencies,
// stereo panning, when sources start and stop, and gain ramps, without
// making a sound. jsdom has no Web Audio at all.
import { vi } from 'vitest';

export interface Recorded {
  frequencies: number[];
  pans: Array<{ value: number }>;
  starts: number[];
  stops: number[];
  ramps: Array<{ value: number; time: number }>;
  gains: Array<{ value: number }>;
}

export interface FakeContext {
  currentTime: number;
  state: AudioContextState;
}

export function installFakeAudio(): { rec: Recorded; ctx: () => FakeContext } {
  const rec: Recorded = { frequencies: [], pans: [], starts: [], stops: [], ramps: [], gains: [] };
  let made: FakeContext | null = null;
  const param = (initial = 0) => {
    const p = {
      value: initial,
      setValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn(),
      setTargetAtTime: vi.fn((v: number) => {
        p.value = v;
      }),
      exponentialRampToValueAtTime: vi.fn((value: number, time: number) => rec.ramps.push({ value, time })),
      linearRampToValueAtTime: vi.fn((value: number, time: number) => rec.ramps.push({ value, time })),
    };
    return p;
  };
  const node = () => ({ connect: vi.fn((n: unknown) => n), disconnect: vi.fn() });
  const scheduled = () => ({
    ...node(),
    start: vi.fn((when = 0) => rec.starts.push(when)),
    stop: vi.fn((when = -1) => rec.stops.push(when)),
  });

  class FakeAudioContext implements FakeContext {
    currentTime = 10;
    state: AudioContextState = 'running';
    sampleRate = 8000;
    destination = node();
    resume = vi.fn(async () => undefined);
    createOscillator = () => {
      const frequency = param();
      const index = rec.frequencies.push(0) - 1;
      Object.defineProperty(frequency, 'value', { get: () => rec.frequencies[index], set: (v: number) => (rec.frequencies[index] = v) });
      return { ...scheduled(), type: 'sine', frequency };
    };
    createBufferSource = () => ({ ...scheduled(), buffer: null, loop: false });
    createGain = () => {
      const gain = param(1);
      rec.gains.push(gain);
      return { ...node(), gain };
    };
    createStereoPanner = () => {
      const pan = param(0);
      rec.pans.push(pan);
      return { ...node(), pan };
    };
    createBiquadFilter = () => ({ ...node(), type: 'lowpass', frequency: param() });
    createConvolver = () => ({ ...node(), buffer: null });
    createDynamicsCompressor = () => ({ ...node(), threshold: param(), ratio: param(), attack: param(), release: param() });
    createBuffer = (channels: number, length: number) => {
      const data = Array.from({ length: channels }, () => new Float32Array(length));
      return { numberOfChannels: channels, length, getChannelData: (c: number) => data[c] };
    };
  }

  vi.stubGlobal(
    'AudioContext',
    // A plain function, so the code under test can call it with `new`.
    vi.fn(function makeContext() {
      made = new FakeAudioContext();
      return made;
    }),
  );
  return { rec, ctx: () => made! };
}
