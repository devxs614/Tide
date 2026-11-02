// Counting back (v2.1 F-13): from a start, subtract a step, ten times or
// until the next number would go below zero. Smaller steps are easier.
// When a typed answer is off, the feedback just gives the number and moves
// on: never "wrong", never a mark against anyone.
export const COUNT_STEPS = [7, 6, 5, 4, 3, 2] as const;
export const COUNT_STARTS = [100, 50, 30, 20] as const;
export const COUNT_ROUNDS = 10;

// The numbers in order, the start first: at most eleven (the start and ten
// answers), fewer when zero comes first.
export function countBackSequence(start: number, step: number): number[] {
  const out = [start];
  while (out.length <= COUNT_ROUNDS && out[out.length - 1] - step >= 0) out.push(out[out.length - 1] - step);
  return out;
}

export type Feedback = { kind: 'right' } | { kind: 'close'; expected: number } | { kind: 'empty' };

export function checkAnswer(typed: string, expected: number): Feedback {
  const value = typed.trim();
  if (!value) return { kind: 'empty' };
  return Number(value) === expected ? { kind: 'right' } : { kind: 'close', expected };
}
