// The crisis phrase check: every listed phrase is caught, everyday stress
// idioms are not, and spelling differences don't let a phrase slip by.
import { describe, expect, it } from 'vitest';
import { detectCrisis, normalizeForSafety } from './detect';
import { SAFETY_PHRASES } from './keywords';

describe('detectCrisis', () => {
  it('catches every phrase on the list, in context', () => {
    for (const phrase of SAFETY_PHRASES) {
      expect(detectCrisis(`honestly ${phrase} today`), phrase).toBe(true);
    }
  });

  it('ignores case, accents and apostrophes in English and Spanish', () => {
    expect(detectCrisis('I think I want to DIE')).toBe(true);
    expect(detectCrisis('i cant go on like this')).toBe(true);
    expect(detectCrisis('I can’t go on')).toBe(true);
    expect(detectCrisis('Self-Harm again')).toBe(true);
    expect(detectCrisis('quiero hacerme dano')).toBe(true);
    expect(detectCrisis('Quiero hacerme DAÑO')).toBe(true);
    expect(detectCrisis('Me quiero morir.')).toBe(true);
    expect(detectCrisis('pienso en el SUICIDIO')).toBe(true);
  });

  it('does not fire on everyday idioms about stress', () => {
    expect(detectCrisis('this deadline is killing me')).toBe(false);
    expect(detectCrisis("I'm dying to finish this lab")).toBe(false);
    expect(detectCrisis('dead tired after calculus')).toBe(false);
    expect(detectCrisis('Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.')).toBe(false);
    expect(detectCrisis('me muero de sueño')).toBe(false);
  });

  it('matches whole words only', () => {
    expect(detectCrisis('the suicidesquad movie')).toBe(false);
    expect(detectCrisis('')).toBe(false);
    expect(detectCrisis(undefined)).toBe(false);
  });

  it('normalizes text the same way for every input', () => {
    expect(normalizeForSafety('  Hacerme DAÑO!! ')).toBe('hacerme dano');
  });
});
