// Every kind of number that shows up in text Tide reads aloud, written out
// in English so no device reads "four" as "cuatro".
import { describe, expect, it } from 'vitest';
import { numberInWords, spokenText } from './spokenNumbers';

describe('spokenText', () => {
  it('writes out the numbers in strategy steps and pattern sentences', () => {
    expect(spokenText('Breathe in for 4.')).toBe('Breathe in for four.');
    expect(spokenText('3-minute walk helped you 4 of 5 times.')).toBe('three-minute walk helped you four of five times.');
    expect(spokenText('Count back from 100. Subtract 7 each time.')).toBe('Count back from one hundred. Subtract seven each time.');
  });

  it('reads a countdown as separate numbers, and times and percentages naturally', () => {
    expect(spokenText('5-4-3-2-1 senses')).toBe('five, four, three, two, one senses');
    expect(spokenText('Calculus at 4:50 pm')).toBe('Calculus at four fifty pm');
    expect(spokenText('Starts 4:05, ends 6:00 pm')).toBe('Starts four oh five, ends six pm');
    expect(spokenText('usually 25% of the time')).toBe('usually twenty-five percent of the time');
  });

  it('leaves text without numbers alone', () => {
    expect(spokenText('Drained. Low battery; starting anything feels like a lot')).toBe('Drained. Low battery; starting anything feels like a lot');
  });
});

describe('numberInWords', () => {
  it('covers teens, tens, hundreds and thousands', () => {
    expect([0, 13, 40, 47, 203, 2026].map(numberInWords)).toEqual([
      'zero',
      'thirteen',
      'forty',
      'forty-seven',
      'two hundred three',
      'two thousand twenty-six',
    ]);
  });
});
