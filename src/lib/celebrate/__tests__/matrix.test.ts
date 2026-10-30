// The celebration matrix (v2 spec 10.3, 21.2): every tier × state × motion
// level, the settings that tone it down, and the frequency caps.
import { beforeEach, describe, expect, it } from 'vitest';
import type { MotionLevel } from '@/lib/motion/tokens';
import { capTier, resetCelebrationCapsForTests } from '../caps';
import { decide, isPleasant, type Column, type Tier } from '../matrix';

const COLUMNS: Column[] = ['swell', 'still', 'neutral', 'surge', 'ebb'];
const TIERS: Tier[] = ['micro', 'small', 'big'];
const LEVELS: MotionLevel[] = ['off', 'calm', 'lively'];

const run = (tier: Tier, column: Column, level: MotionLevel = 'lively', setting: 'full' | 'gentle' | 'off' = 'full', confetti = true) =>
  decide({ event: 'taskDone', tier, quadrant: column === 'neutral' ? null : column, level, setting, confetti });

describe('celebration matrix', () => {
  it('never shows an overlay on a hard day, at any tier or level', () => {
    for (const tier of TIERS) for (const level of LEVELS) for (const column of ['surge', 'ebb'] as const) {
      expect(run(tier, column, level).overlay, `${tier} ${column} ${level}`).toBeNull();
    }
  });

  it('gives hard days kind words instead of a party', () => {
    expect(run('small', 'ebb').toast).toBe('That counted.');
    expect(run('small', 'surge').toast).toBe('Done. One less thing.');
    expect(run('big', 'ebb').toast).toBe('You did that on a low day. It counts.');
    expect(run('big', 'surge').toast).toBe('You did a hard thing while a lot was going on.');
    expect(run('small', 'ebb').sound).toBeNull();
    expect(run('small', 'surge').sound?.volume).toBeLessThan(1);
  });

  it('follows the table for small wins', () => {
    expect(run('small', 'swell').effect).toBe('sparkleBurst');
    expect(run('small', 'still').effect).toBe('sparkleRing');
    expect(run('small', 'neutral').effect).toBe('sparkleBurst');
    expect(run('small', 'surge').effect).toBe('ripple');
    expect(run('small', 'ebb').effect).toBe('glow');
    expect(run('micro', 'ebb').effect).toBe('glow');
    expect(run('micro', 'swell').sound?.name).toBe('select');
  });

  it('uses confetti only at Lively, with confetti on, in pleasant states', () => {
    expect(run('big', 'swell', 'lively').overlay).toEqual({ particles: 'confetti', plain: false });
    expect(run('big', 'swell', 'calm').overlay).toEqual({ particles: 'sparkles', plain: false });
    expect(run('big', 'swell', 'lively', 'full', false).overlay?.particles).toBe('sparkles');
    expect(run('big', 'still', 'lively').overlay?.particles).toBe('bubbles');
  });

  it('at motion Off: no effects, a still dialog for pleasant big moments, words for the rest', () => {
    for (const tier of TIERS) for (const column of COLUMNS) {
      const d = run(tier, column, 'off');
      expect(d.effect).toBe('none');
      if (d.overlay) expect(d.overlay).toEqual({ particles: 'none', plain: true });
      if (tier === 'small') expect(d.toast, `${column}`).toBeTruthy();
      if (tier === 'big') expect(!!d.overlay || !!d.toast).toBe(true);
    }
  });

  it('"Gentle" turns big into small; "Off" keeps micro and the words of big moments', () => {
    expect(run('big', 'swell', 'lively', 'gentle').tier).toBe('small');
    expect(run('big', 'swell', 'lively', 'gentle').overlay).toBeNull();
    const off = run('big', 'swell', 'lively', 'off');
    expect(off.tier).toBe('micro');
    expect(off.overlay).toBeNull();
    expect(off.toast).toBe('Task done.');
    expect(run('small', 'swell', 'lively', 'off').toast).toBeNull();
  });

  it('marks the pleasant columns', () => {
    expect(COLUMNS.filter(isPleasant)).toEqual(['swell', 'still', 'neutral']);
  });
});

describe('celebration caps', () => {
  beforeEach(() => resetCelebrationCapsForTests());

  it('allows one big moment every 10 minutes', () => {
    expect(capTier('big', 0)).toBe('big');
    expect(capTier('big', 5 * 60_000)).toBe('small');
    expect(capTier('big', 11 * 60_000)).toBe('big');
  });

  it('allows three small ones a minute, then quiet ones', () => {
    expect([capTier('small', 0), capTier('small', 1000), capTier('small', 2000), capTier('small', 3000)]).toEqual(['small', 'small', 'small', 'micro']);
    expect(capTier('small', 61_000)).toBe('small');
  });
});
