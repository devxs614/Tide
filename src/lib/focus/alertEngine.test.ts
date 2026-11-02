// The focus alert on the audio clock (v2.1 F-06, spec 10.5), with a fake
// AudioContext that records when each sound was asked to start and stop:
// scheduled at start for the time left, stopped on pause, scheduled again
// on resume, at most three plays with "repeat", and played at once when
// the context slept through the end.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelEndAlert, resetAlertEngineForTests, scheduleEndAlert, settleEndAlert, unlockAlertAudio } from './alertEngine';

const starts: number[] = [];
const stops: number[] = [];
let fake: FakeContext;

const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() });
const node = () => ({ connect: vi.fn((n: unknown) => n), disconnect: vi.fn() });
const source = () => ({
  ...node(),
  frequency: param(),
  type: 'sine',
  buffer: null,
  start: vi.fn((when: number) => starts.push(when)),
  stop: vi.fn((when?: number) => when === undefined && stops.push(-1)),
});

class FakeContext {
  currentTime = 100;
  state: AudioContextState = 'running';
  sampleRate = 8000;
  destination = node();
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  createOscillator = source;
  createBufferSource = source;
  createGain = () => ({ ...node(), gain: param() });
  createBiquadFilter = () => ({ ...node(), type: 'lowpass', frequency: param() });
  createConvolver = () => ({ ...node(), buffer: null });
  createDynamicsCompressor = () => ({ ...node(), threshold: param(), ratio: param(), attack: param(), release: param() });
  createBuffer = (channels: number, length: number) => ({ getChannelData: () => new Float32Array(length), numberOfChannels: channels });
}

const OPTS = { tone: 'chime' as const, volume: 0.6, repeat: 'once' as const };

beforeEach(() => {
  starts.length = 0;
  stops.length = 0;
  resetAlertEngineForTests();
  // Remember the one context the engine makes, to move its clock.
  vi.stubGlobal(
    'AudioContext',
    // A plain function, so the engine can call it with `new`.
    vi.fn(function makeContext() {
      fake = new FakeContext();
      return fake;
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('the focus alert engine', () => {
  it('schedules the end on the audio clock, stops it on pause, and schedules again on resume', () => {
    unlockAlertAudio();
    scheduleEndAlert(300, OPTS);
    // The chime's two notes: at the end, and 0.12 s later.
    expect(starts).toEqual([400, 400.12]);
    cancelEndAlert();
    expect(stops).toHaveLength(2);
    starts.length = 0;
    fake.currentTime = 160;
    scheduleEndAlert(240, OPTS);
    expect(starts).toEqual([400, 400.12]);
  });

  it('repeats at most three times, 20 seconds apart', () => {
    unlockAlertAudio();
    scheduleEndAlert(10, { ...OPTS, tone: 'warning' as never, repeat: 'gentle_repeat' });
    expect(starts).toEqual([110, 130, 150]);
  });

  it('leaves a sound that already played alone, and plays at once if the context slept', () => {
    unlockAlertAudio();
    scheduleEndAlert(300, OPTS);
    fake.currentTime = 400.5;
    settleEndAlert(OPTS);
    expect(starts).toEqual([400, 400.12]);

    starts.length = 0;
    scheduleEndAlert(300, OPTS);
    // A phone that suspended audio: the clock stood still at 400.5.
    fake.state = 'suspended';
    settleEndAlert(OPTS);
    expect(fake.resume).toHaveBeenCalled();
    expect(starts.slice(-2)).toEqual([400.55, 400.67]);
  });
});
