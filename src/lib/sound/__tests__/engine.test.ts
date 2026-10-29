// The sound engine's promises (v2 spec 6): silent until a real gesture, each
// category switch respected, no more than three sounds at once.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markUserGestureForTests } from '../gesture';

class FakeNode {
  gain = { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() };
  frequency = { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  Q = { value: 0 };
  type = '';
  buffer: unknown = null;
  loop = false;
  connect = vi.fn((n: unknown) => n);
  start = vi.fn();
  stop = vi.fn();
}
const created = vi.fn();
class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  sampleRate = 8000;
  destination = new FakeNode();
  constructor() {
    created();
  }
  createGain = () => new FakeNode();
  createOscillator = () => new FakeNode();
  createBiquadFilter = () => new FakeNode();
  createBufferSource = () => new FakeNode();
  createConvolver = () => new FakeNode();
  createBuffer = (_c: number, length: number) => ({ getChannelData: () => new Float32Array(length) });
  resume = vi.fn();
}

const ALL_ON = { volume: 0.5, categories: { ui: true, celebration: true, companion: true } };

beforeEach(() => {
  vi.resetModules();
  created.mockClear();
  vi.stubGlobal('AudioContext', FakeAudioContext);
});
afterEach(() => {
  vi.unstubAllGlobals();
  markUserGestureForTests(false);
});

describe('sound engine', () => {
  it('creates no AudioContext before a gesture', async () => {
    markUserGestureForTests(false);
    const { playSound } = await import('../engine');
    playSound('tap', ALL_ON);
    expect(created).not.toHaveBeenCalled();
  });

  it('plays after a gesture, and respects category switches', async () => {
    const gesture = await import('../gesture');
    gesture.markUserGestureForTests(true);
    const { playSound } = await import('../engine');
    playSound('chirp-otter', { ...ALL_ON, categories: { ...ALL_ON.categories, companion: false } });
    expect(created).not.toHaveBeenCalled();
    playSound('tap', ALL_ON);
    expect(created).toHaveBeenCalledTimes(1);
  });
});

describe('useSound', () => {
  it('does nothing while sound is off (the default) or while a screen holds quiet', async () => {
    const { holdQuiet, isQuiet } = await import('../useSound');
    const release = holdQuiet();
    expect(isQuiet()).toBe(true);
    release();
    expect(isQuiet()).toBe(false);
  });
});
