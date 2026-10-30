// Companion names (v2 spec 8.7): 1–16 letters, spaces, hyphens and
// apostrophes, trimmed, in any alphabet.
import { describe, expect, it } from 'vitest';
import { cleanCompanionName, companionNameProblem } from '../name';

describe('companion names', () => {
  it('accepts letters in any alphabet, spaces, hyphens and apostrophes', () => {
    for (const name of ['Pebble', 'Zoë', 'Ñoño', "D'Arcy", 'D’Arcy', 'Mochi-San', 'Sir Shelby', 'Ana María']) {
      expect(companionNameProblem(name), name).toBeNull();
    }
  });

  it('trims and squeezes spaces', () => {
    expect(cleanCompanionName('  Sir   Shelby ')).toBe('Sir Shelby');
    expect(companionNameProblem('  Capi  ')).toBeNull();
  });

  it('explains what is wrong, in three kinds', () => {
    expect(companionNameProblem('')).toBe('empty');
    expect(companionNameProblem('    ')).toBe('empty');
    expect(companionNameProblem('Abcdefghijklmnopq')).toBe('long');
    expect(companionNameProblem('Abcdefghijklmnop')).toBeNull();
    expect(companionNameProblem('R2D2')).toBe('chars');
    expect(companionNameProblem('Pebble!')).toBe('chars');
  });
});
