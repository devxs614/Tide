// Five small 4×4 sudoku puzzles for the "Mini sudoku" strategy. Each has
// exactly one solution (checked by a brute-force solver in sudoku.test.ts),
// so "Check" can compare against the solution without ever being unfair.
// 0 means an empty cell. Rows are written left to right, top to bottom.

export interface SudokuPuzzle {
  given: number[];
  solution: number[];
}

export const SUDOKU_PUZZLES: SudokuPuzzle[] = [
  {
    given: [0, 0, 3, 0, 0, 0, 0, 2, 2, 0, 0, 0, 4, 3, 2, 0],
    solution: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1],
  },
  {
    given: [2, 0, 0, 3, 0, 3, 0, 0, 1, 0, 0, 0, 0, 4, 1, 0],
    solution: [2, 1, 4, 3, 4, 3, 2, 1, 1, 2, 3, 4, 3, 4, 1, 2],
  },
  {
    given: [0, 4, 1, 0, 0, 0, 0, 4, 4, 0, 0, 0, 2, 0, 0, 3],
    solution: [3, 4, 1, 2, 1, 2, 3, 4, 4, 3, 2, 1, 2, 1, 4, 3],
  },
  {
    given: [0, 0, 0, 1, 0, 0, 4, 0, 0, 4, 0, 2, 1, 0, 0, 4],
    solution: [4, 3, 2, 1, 2, 1, 4, 3, 3, 4, 1, 2, 1, 2, 3, 4],
  },
  {
    given: [0, 0, 0, 4, 2, 0, 0, 0, 3, 0, 4, 0, 0, 2, 3, 0],
    solution: [1, 3, 2, 4, 2, 4, 1, 3, 3, 1, 4, 2, 4, 2, 3, 1],
  },
];
