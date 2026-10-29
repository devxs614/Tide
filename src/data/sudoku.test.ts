// Every mini sudoku in the toolkit must have exactly one solution that fits
// its givens, or the "Mini sudoku" strategy could leave someone stuck.
import { describe, expect, it } from 'vitest';
import { SUDOKU_PUZZLES } from './sudoku';

function fits(grid: number[], i: number, v: number): boolean {
  const r = Math.floor(i / 4);
  const c = i % 4;
  for (let k = 0; k < 4; k++) if (grid[r * 4 + k] === v || grid[k * 4 + c] === v) return false;
  const br = r - (r % 2);
  const bc = c - (c % 2);
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if (grid[(br + a) * 4 + bc + b] === v) return false;
  return true;
}

function countSolutions(grid: number[]): number {
  const i = grid.indexOf(0);
  if (i < 0) return 1;
  let n = 0;
  for (let v = 1; v <= 4 && n < 2; v++) {
    if (fits(grid, i, v)) {
      grid[i] = v;
      n += countSolutions(grid);
      grid[i] = 0;
    }
  }
  return n;
}

function validSolution(s: number[]): boolean {
  return s.every((v, i) => {
    const copy = [...s];
    copy[i] = 0;
    return fits(copy, i, v);
  });
}

describe('sudoku puzzles', () => {
  it.each(SUDOKU_PUZZLES.map((p, i) => [i, p] as const))('puzzle %i has one valid solution that matches its givens', (_, p) => {
    expect(validSolution(p.solution)).toBe(true);
    p.given.forEach((v, i) => v && expect(v).toBe(p.solution[i]));
    expect(countSolutions([...p.given])).toBe(1);
  });
});
