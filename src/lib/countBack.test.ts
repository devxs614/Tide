// Counting back (v2.1 F-13): the numbers for every step and start, and
// neutral feedback that gives the number and moves on.
import { describe, expect, it } from 'vitest';
import { checkAnswer, COUNT_STARTS, COUNT_STEPS, countBackSequence } from './countBack';

describe('count back', () => {
  it('counts back by 7 from 100, ten times, as v2 did', () => {
    expect(countBackSequence(100, 7)).toEqual([100, 93, 86, 79, 72, 65, 58, 51, 44, 37, 30]);
  });

  it('stops before going below zero, for every step and start', () => {
    expect(countBackSequence(20, 7)).toEqual([20, 13, 6]);
    for (const start of COUNT_STARTS) {
      for (const step of COUNT_STEPS) {
        const seq = countBackSequence(start, step);
        expect(seq[0]).toBe(start);
        expect(seq.length).toBeLessThanOrEqual(11);
        expect(Math.min(...seq)).toBeGreaterThanOrEqual(0);
        seq.slice(1).forEach((n, i) => expect(seq[i] - n).toBe(step));
      }
    }
  });

  it('answers a typed number without judging it', () => {
    expect(checkAnswer('93', 93)).toEqual({ kind: 'right' });
    expect(checkAnswer(' 92 ', 93)).toEqual({ kind: 'close', expected: 93 });
    expect(checkAnswer('', 93)).toEqual({ kind: 'empty' });
  });
});
