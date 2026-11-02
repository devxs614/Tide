// "Try a look" (v2.1 F-11, spec 15.4): the snapshot covers every key a look
// can change, so "Back to my look" is exact; "Surprise me" is the same all
// day and goes through every look before repeating, never the current one.
import { describe, expect, it } from 'vitest';
import { LOOKS } from '@/data/looks';
import { DEFAULT_SETTINGS } from '@/lib/repo/settings';
import { LOOK_KEYS, nextSurprise, snapshotOf, surpriseOrder } from './looks';

describe('looks', () => {
  it('snapshots every key any look sets, and nothing else', () => {
    const snap = snapshotOf({ ...DEFAULT_SETTINGS, 'appearance.theme': 'ink', 'motion.level': 'off' });
    for (const look of LOOKS) for (const key of Object.keys(look.values)) expect(snap).toHaveProperty(key);
    expect(snap['appearance.theme']).toBe('ink');
    expect(Object.keys(snap).sort()).toEqual([...LOOK_KEYS].sort());
    expect(LOOK_KEYS).not.toContain('companion.species');
  });

  it('shuffles the same way all day, and differently another day', () => {
    expect(surpriseOrder('2026-11-02')).toEqual(surpriseOrder('2026-11-02'));
    expect(surpriseOrder('2026-11-02').sort()).toEqual(LOOKS.map((l) => l.id).sort());
    expect(surpriseOrder('2026-11-02')).not.toEqual(surpriseOrder('2026-11-03'));
  });

  it('goes through all eight before repeating, skipping the look on screen', () => {
    const order = surpriseOrder('2026-11-02');
    let cursor = -1;
    let current = order[0];
    const seen: string[] = [];
    for (let i = 0; i < 7; i++) {
      const next = nextSurprise(order, cursor, current);
      expect(next.id).not.toBe(current);
      seen.push(next.id);
      cursor = next.cursor;
      current = next.id;
    }
    expect(new Set(seen).size).toBe(7);
  });
});
