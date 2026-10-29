// Motion level resolution (v2 spec 5.2) and the per-level transitions.
import { describe, expect, it } from 'vitest';
import { resolveMotionLevel } from './resolve';
import { distanceFor, motionFor, spring } from './tokens';

describe('motion level', () => {
  it('uses the explicit choice first', () => {
    expect(resolveMotionLevel({ 'motion.level': 'lively', reduceMotion: false }, true)).toBe('lively');
  });
  it("falls back to the device's reduced motion, then Calm", () => {
    expect(resolveMotionLevel({ 'motion.level': 'auto', reduceMotion: false }, true)).toBe('off');
    expect(resolveMotionLevel({ 'motion.level': 'auto', reduceMotion: false }, false)).toBe('calm');
  });
  it("treats v1's Reduce motion as Off", () => {
    expect(resolveMotionLevel({ 'motion.level': 'auto', reduceMotion: true }, false)).toBe('off');
  });
});

describe('motionFor', () => {
  it('moves nothing at Off, softens bounce at Calm, keeps it at Lively', () => {
    expect(motionFor('off', 'bouncy')).toEqual({ duration: 0 });
    expect(motionFor('calm', 'bouncy')).toEqual(spring.gentle);
    expect(motionFor('lively', 'bouncy')).toEqual(spring.bouncy);
    expect([distanceFor('off', 16), distanceFor('calm', 16), distanceFor('lively', 16)]).toEqual([0, 8, 16]);
  });
});
