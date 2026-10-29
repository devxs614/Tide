// Placing a check-in on the mood map: the four corners, the neutral middle,
// and the average of two picked words.
import { describe, expect, it } from 'vitest';
import { averagePoint, toQuadrant } from './quadrant';

describe('toQuadrant', () => {
  it('puts each corner of the map in the right state', () => {
    expect(toQuadrant(3, -3)).toBe('surge');
    expect(toQuadrant(3, 3)).toBe('swell');
    expect(toQuadrant(-3, -3)).toBe('ebb');
    expect(toQuadrant(-3, 3)).toBe('still');
  });

  it('treats zero as high energy and pleasant so a neutral check-in is never Ebb', () => {
    expect(toQuadrant(0, 0)).toBe('swell');
    expect(toQuadrant(0, -1)).toBe('surge');
    expect(toQuadrant(-1, 0)).toBe('still');
  });
});

describe('averagePoint', () => {
  it('averages two picked words and rounds back onto the grid', () => {
    expect(averagePoint([{ energy: -3, pleasantness: -3 }, { energy: 2, pleasantness: -3 }])).toEqual({
      energy: -1,
      pleasantness: -3,
    });
  });

  it('starts at the center when nothing is picked', () => {
    expect(averagePoint([])).toEqual({ energy: 0, pleasantness: 0 });
  });
});
