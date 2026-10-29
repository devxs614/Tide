// The zod schemas for each AI route, checked against the spec examples and
// against the mistakes the model tends to make.
import { describe, expect, it } from 'vitest';
import { EMOTION_IDS } from '@/data/emotions';
import {
  BridgeOutput,
  DayModeOutput,
  LabelInput,
  LabelOutput,
  NarrateOutput,
  UnstickOutput,
  checkBridgeOutput,
  checkDayModeOutput,
  checkLabelOutput,
  checkNarrateKeys,
  checkUnstickOutput,
  numbersAreFromFacts,
  type DayModeInputT,
  type LabelInputT,
} from './schemas';

// The example from Section 10.5.1 of the spec, as the AI Prompts PDF shows it.
const labelInput: LabelInputT = {
  mode: 'gentle',
  localTime: 'Thu 3:40 pm',
  text: 'Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.',
  vocabulary: EMOTION_IDS,
};
const labelExample = {
  candidates: [
    { id: 'drained', definition: 'Low battery; starting anything feels like a lot', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked from something you want to get done', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'The task feels too big to hold at once', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: "Is it more that you're tired, or that the report feels too big?",
  safetyFlag: false,
};

describe('label schemas', () => {
  it('accepts the example input and output from the spec', () => {
    expect(LabelInput.safeParse(labelInput).success).toBe(true);
    const parsed = LabelOutput.parse(labelExample);
    expect(checkLabelOutput(labelInput, parsed)).toBeNull();
  });

  it('needs either words or body cues', () => {
    expect(LabelInput.safeParse({ ...labelInput, text: undefined }).success).toBe(false);
    expect(LabelInput.safeParse({ ...labelInput, text: undefined, bodyCues: ['chest:tight'] }).success).toBe(true);
  });

  it('rejects two candidates, out-of-range numbers and a missing safety flag', () => {
    expect(LabelOutput.safeParse({ ...labelExample, candidates: labelExample.candidates.slice(0, 2) }).success).toBe(false);
    const tooHigh = structuredClone(labelExample);
    tooHigh.candidates[0].energy = 9;
    expect(LabelOutput.safeParse(tooHigh).success).toBe(false);
    const { safetyFlag: _omit, ...noFlag } = labelExample;
    void _omit;
    expect(LabelOutput.safeParse(noFlag).success).toBe(false);
  });

  it('catches made-up and repeated emotion ids', () => {
    const madeUp = structuredClone(labelExample);
    madeUp.candidates[2].id = 'melancholic';
    expect(checkLabelOutput(labelInput, madeUp)).toMatch(/not in vocabulary/);
    const repeated = structuredClone(labelExample);
    repeated.candidates[2].id = 'drained';
    expect(checkLabelOutput(labelInput, repeated)).toMatch(/distinct/);
  });
});

describe('unstick schemas', () => {
  const input = {
    mode: 'gentle' as const,
    task: { title: 'Chemistry lab report', type: 'writing' as const, energyCost: 3 },
    reason: 'dont_know_start' as const,
    helpfulStrategies: [{ id: 'm-walk-3', name: '3-minute walk', better: 4, n: 5 }],
  };
  it('accepts a step with an allowed focus length and strategy', () => {
    const out = UnstickOutput.parse({ firstStep: 'Open the report and type only the title and date.', focusMinutes: 5, strategyId: 'm-walk-3', why: 'Small start.' });
    expect(checkUnstickOutput(input, out)).toBeNull();
  });
  it('rejects a 7-minute block and an invented strategy', () => {
    expect(UnstickOutput.safeParse({ firstStep: 'x', focusMinutes: 7, strategyId: null, why: 'x' }).success).toBe(false);
    expect(checkUnstickOutput(input, { firstStep: 'x', focusMinutes: 5, strategyId: 'c-box', why: 'x' })).not.toBeNull();
  });
});

describe('daymode checks', () => {
  const input: DayModeInputT = {
    mode: 'gentle',
    requestedMode: 'gentle',
    today: '2026-11-05',
    state: { quadrant: 'ebb', energy: -2, pleasantness: -3 },
    energyBudget: 4,
    tasks: [
      { id: 'a', title: 'A', type: 'writing', energyCost: 3, due: '2026-11-06', status: 'in_progress' },
      { id: 'b', title: 'B', type: 'admin', energyCost: 1, due: '2026-11-05', status: 'not_started' },
      { id: 'c', title: 'C', type: 'chores', energyCost: 2, due: null, status: 'not_started' },
    ],
    events: [],
  };
  it('accepts a plan that places every task once within budget', () => {
    expect(checkDayModeOutput(input, DayModeOutput.parse({ keep: ['a', 'b'], move: ['c'], rationale: 'ok' }))).toBeNull();
  });
  it('rejects a dropped task, a duplicate and an overspent budget', () => {
    expect(checkDayModeOutput(input, { keep: ['a'], move: ['c'], rationale: '' })).not.toBeNull();
    expect(checkDayModeOutput(input, { keep: ['a', 'b'], move: ['c', 'b'], rationale: '' })).not.toBeNull();
    expect(checkDayModeOutput(input, { keep: ['a', 'b', 'c'], move: [], rationale: '' })).toMatch(/over the budget/);
  });
});

describe('bridge and narrate checks', () => {
  it('only accepts a strategy from the candidates', () => {
    const input = {
      mode: 'gentle' as const,
      minutesUntil: 9,
      from: { label: 'Chemistry lab' },
      to: { title: 'Calculus', kind: 'class' },
      candidateStrategies: [{ id: 'c-box', name: 'Box breathing', durationSec: 120, better: 4, n: 5 }],
    };
    expect(checkBridgeOutput(input, BridgeOutput.parse({ parkingPrompt: 'Where did you stop?', strategyId: 'c-box', prepSteps: [] }))).toBeNull();
    expect(checkBridgeOutput(input, { parkingPrompt: 'x', strategyId: 'm-walk-3', prepSteps: [] })).not.toBeNull();
  });

  it('requires the same keys and only numbers that exist in the facts', () => {
    const input = { mode: 'gentle' as const, patterns: [{ key: 'k1', kind: 'strategy_effect' as const, facts: { strategyName: 'Box breathing', k: 4, n: 5 } }] };
    const ok = NarrateOutput.parse({ cards: [{ key: 'k1', title: 'Box breathing helps', body: 'Often better.', whyText: '4 of 5 times.' }] });
    expect(checkNarrateKeys(input, ok)).toBeNull();
    expect(checkNarrateKeys(input, { cards: [] })).not.toBeNull();
    expect(numbersAreFromFacts(ok.cards[0], input.patterns[0].facts)).toBe(true);
    expect(numbersAreFromFacts({ ...ok.cards[0], body: 'It works 80% of the time.' }, input.patterns[0].facts)).toBe(false);
  });
});
