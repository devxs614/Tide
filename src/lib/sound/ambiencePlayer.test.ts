// The ambience player (v2.1 F-09, spec 13.5) on a fake AudioContext: every
// sound builds, binaural is two tones panned hard left and right at the
// right pitches, volume is capped, stopping fades out, "until focus ends"
// is silent before the end alert, and the crisis screen's quiet stops it.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeAudio, type Recorded } from '@/test/fakeAudioContext';
import { getAmbienceState } from './ambienceState';
import { AMBIENCE_IDS } from './names';
import { holdQuiet } from './useSound';
import { capVolume, playAmbience, resetAmbiencePlayerForTests, scheduleAmbienceEnd, stopAmbience } from './ambiencePlayer';

let rec: Recorded;
const OPTS = { volume: 0.4, title: 'Rain' };

beforeEach(() => {
  resetAmbiencePlayerForTests();
  rec = installFakeAudio().rec;
});
afterEach(() => vi.unstubAllGlobals());

describe('the ambience player', () => {
  it('builds every one of the nine sounds', () => {
    for (const id of AMBIENCE_IDS) {
      expect(() => playAmbience(id, OPTS)).not.toThrow();
      expect(getAmbienceState().sound).toBe(id);
    }
  });

  it('plays binaural as two tones panned hard left and right', () => {
    playAmbience('binaural_focus', OPTS);
    expect(rec.frequencies).toEqual([200, 214]);
    expect(rec.pans.map((p) => p.value)).toEqual([-1, 1]);
    rec.frequencies.length = 0;
    rec.pans.length = 0;
    playAmbience('binaural_calm', OPTS);
    expect(rec.frequencies).toEqual([180, 186]);
    expect(rec.pans.map((p) => p.value)).toEqual([-1, 1]);
  });

  it('caps the volume at half of full scale', () => {
    expect(capVolume(1)).toBe(0.5);
    expect(capVolume(3)).toBe(0.5);
    expect(capVolume(0.4)).toBeCloseTo(0.2);
  });

  it('fades out over 1.5 seconds when stopped', () => {
    playAmbience('rain', OPTS);
    rec.ramps.length = 0;
    stopAmbience();
    expect(rec.ramps.at(-1)).toEqual({ value: 0.0001, time: 11.5 });
    expect(rec.stops.at(-1)).toBeCloseTo(11.55);
    expect(getAmbienceState().sound).toBeNull();
  });

  it('"until focus ends" is silent half a second before the block ends', () => {
    playAmbience('rain', { ...OPTS, untilFocusEnds: true });
    rec.ramps.length = 0;
    scheduleAmbienceEnd(300);
    // The block (and its end alert) ends at audio time 310.
    expect(rec.ramps.at(-1)).toEqual({ value: 0.0001, time: 309.5 });
  });

  it('stops at once on the crisis screen, and refuses to start there', () => {
    playAmbience('waves', OPTS);
    const release = holdQuiet();
    expect(getAmbienceState().sound).toBeNull();
    playAmbience('waves', OPTS);
    expect(getAmbienceState().sound).toBeNull();
    release();
  });
});
