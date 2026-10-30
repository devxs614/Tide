'use client';

// Mini sudoku: a 4×4 grid that gives a racing mind one small, clear job. No
// timer, no score, and "Check" never says "wrong": cells that don't match
// get a dotted outline and "2 cells to look at again". Arrow keys move,
// number keys 1–4 fill a cell, Backspace clears it.
import { useEffect, useState, type KeyboardEvent } from 'react';
import { copy, fill } from '@/copy/en';
import { SUDOKU_PUZZLES } from '@/data/sudoku';
import { Button } from '@/components/ui/button';
import { emitCompanion } from '@/lib/companion/bus';
import { cn } from '@/lib/utils';
import type { ToolProps } from './types';

// Each opening shows the next puzzle in turn, so a second round is new.
let nextPuzzle = 0;
function takePuzzle(): number {
  const index = nextPuzzle % SUDOKU_PUZZLES.length;
  nextPuzzle += 1;
  return index;
}

export function Sudoku4x4({ onDone }: ToolProps) {
  const [index, setIndex] = useState(takePuzzle);
  const puzzle = SUDOKU_PUZZLES[index];
  const [values, setValues] = useState<number[]>(() => [...puzzle.given]);
  const [selected, setSelected] = useState(() => puzzle.given.findIndex((v) => v === 0));
  const [flagged, setFlagged] = useState<number[] | null>(null);

  const isGiven = (i: number) => puzzle.given[i] !== 0;
  const put = (n: number) => {
    if (selected < 0 || isGiven(selected)) return;
    setValues((v) => v.map((x, i) => (i === selected ? n : x)));
    setFlagged(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    const moves: Record<string, number> = { ArrowUp: -4, ArrowDown: 4, ArrowLeft: -1, ArrowRight: 1 };
    if (e.key in moves) {
      e.preventDefault();
      const next = i + moves[e.key];
      if (next >= 0 && next < 16 && !(Math.abs(moves[e.key]) === 1 && Math.floor(next / 4) !== Math.floor(i / 4))) {
        setSelected(next);
        (e.currentTarget.parentElement?.parentElement?.querySelectorAll<HTMLElement>('[role=gridcell]')[next])?.focus();
      }
    } else if (/^[1-4]$/.test(e.key)) put(Number(e.key));
    else if (e.key === 'Backspace' || e.key === 'Delete') put(0);
  };

  const check = () => setFlagged(values.map((v, i) => (v !== 0 && v !== puzzle.solution[i] ? i : -1)).filter((i) => i >= 0));
  const complete = values.every((v, i) => v === puzzle.solution[i]);
  // Solved: the companion in the corner is happy for her (v2 spec 9).
  useEffect(() => {
    if (complete) emitCompanion({ type: 'nudge', expression: 'happy', reaction: 'hop' });
  }, [complete]);
  const message =
    flagged === null
      ? ''
      : flagged.length === 1
        ? copy.tools.sudoku.oneToLookAt
        : flagged.length > 1
          ? fill(copy.tools.sudoku.toLookAt, { n: flagged.length })
          : complete
            ? copy.tools.sudoku.allGood
            : copy.tools.sudoku.soFarSoGood;

  const newPuzzle = () => {
    const i = takePuzzle();
    setIndex(i);
    setValues([...SUDOKU_PUZZLES[i].given]);
    setSelected(SUDOKU_PUZZLES[i].given.findIndex((v) => v === 0));
    setFlagged(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-caption text-ink-soft">{copy.tools.sudoku.keyboardHint}</p>
      <div role="grid" aria-label={copy.tools.sudoku.gridLabel} className="grid w-64 grid-cols-1 overflow-hidden rounded-md border-2 border-ink">
        {[0, 1, 2, 3].map((row) => (
          <div role="row" key={row} className="grid grid-cols-4">
            {[0, 1, 2, 3].map((col) => {
              const i = row * 4 + col;
              const value = values[i];
              const valueText = isGiven(i) ? `${value}, ${copy.tools.sudoku.cellFixed}` : value ? String(value) : copy.tools.sudoku.cellEmpty;
              return (
                <div
                  key={col}
                  role="gridcell"
                  tabIndex={i === selected ? 0 : -1}
                  aria-selected={i === selected}
                  aria-label={fill(copy.tools.sudoku.cellLabel, { row: row + 1, col: col + 1, value: valueText })}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    'flex aspect-square cursor-pointer items-center justify-center border border-line text-h2',
                    col === 1 && 'border-r-2 border-r-ink',
                    row === 1 && 'border-b-2 border-b-ink',
                    isGiven(i) ? 'bg-surface-2 font-bold' : 'bg-surface',
                    i === selected && 'bg-water',
                    flagged?.includes(i) && 'outline-2 -outline-offset-4 outline-notice outline-dotted',
                  )}
                >
                  {value || ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div role="group" aria-label={copy.tools.sudoku.numberPad} className="flex gap-2">
        {[1, 2, 3, 4].map((n) => (
          <Button key={n} variant="secondary" size="icon" aria-label={fill(copy.tools.sudoku.put, { n })} onClick={() => put(n)}>
            {n}
          </Button>
        ))}
        <Button variant="secondary" onClick={() => put(0)}>
          {copy.tools.sudoku.erase}
        </Button>
      </div>
      <p aria-live="polite" className="min-h-6 text-center">
        {message}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={check}>{copy.tools.sudoku.check}</Button>
        <Button variant="secondary" onClick={() => setValues([...puzzle.solution])}>
          {copy.tools.sudoku.showSolution}
        </Button>
        <Button variant="quiet" onClick={newPuzzle}>
          {copy.tools.sudoku.newPuzzle}
        </Button>
      </div>
      <Button variant={complete ? 'default' : 'quiet'} onClick={onDone}>
        {copy.toolkit.imDone}
      </Button>
    </div>
  );
}
