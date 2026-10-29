import { describe, expect, it } from 'vitest';
import { EMOTION_IDS } from '@/data/emotions';
import { TASK_TYPE_IDS } from '@/data/taskTypes';
import { bridgeFallback, dayModeFallback, labelFallback, narrateFallback, unstickFallback } from './fallbacks';
import { FIRST_STEP_TABLE } from './unstickTable';
import {
  LabelOutput,
  NarrateOutput,
  checkDayModeOutput,
  numbersAreFromFacts,
  type DayModeInputT,
  type NarrateInputT,
} from './schemas';
import type { StuckReason } from '@/lib/types';

const REASONS: StuckReason[] = ['dont_know_start', 'too_big', 'boring', 'worried_result', 'place_noise', 'no_energy'];

describe('label fallback', () => {
  it('returns three distinct real words for the demo sentence, starting with what was said first', () => {
    const out = labelFallback({
      mode: 'gentle',
      localTime: 'Thu 3:40 pm',
      text: 'Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.',
      vocabulary: EMOTION_IDS,
    });
    expect(LabelOutput.safeParse(out).success).toBe(true);
    expect(out.candidates.map((c) => c.id)).toEqual(['drained', 'frustrated', 'exhausted']);
    expect(out.safetyFlag).toBe(false);
  });

  it('uses the nearest words to the sliders on the wordless path', () => {
    const out = labelFallback({
      mode: 'literal',
      localTime: 'Thu 3:40 pm',
      bodyCues: ['chest:tight'],
      energyHint: 3,
      pleasantnessHint: -3,
      vocabulary: EMOTION_IDS,
    });
    const ids = out.candidates.map((c) => c.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids.every((id) => EMOTION_IDS.includes(id))).toBe(true);
    expect(ids).toContain('anxious');
  });

  it('still offers three words when nothing in the text matches', () => {
    const out = labelFallback({ mode: 'gentle', localTime: 'x', text: 'hmm', vocabulary: EMOTION_IDS });
    expect(out.candidates).toHaveLength(3);
  });
});

describe('unstick fallback', () => {
  it('has a written step for all 36 reason and task type combinations', () => {
    for (const reason of REASONS) {
      for (const type of TASK_TYPE_IDS) {
        const step = FIRST_STEP_TABLE[reason][type];
        expect(step, `${reason}.${type}`).toBeTruthy();
        expect(step.split(/\s+/).length, `${reason}.${type}`).toBeLessThan(15);
      }
    }
  });

  const base = {
    mode: 'gentle' as const,
    task: { title: 'Chemistry lab report', type: 'writing' as const, energyCost: 3 },
    reason: 'dont_know_start' as const,
    helpfulStrategies: [{ id: 'm-walk-3', name: '3-minute walk', better: 4, n: 5 }],
  };

  it('gives a visibly different step for Ebb and Swell on the same task', () => {
    const ebb = unstickFallback({ ...base, state: { quadrant: 'ebb', energy: -3, pleasantness: -3, emotions: [] } });
    const swell = unstickFallback({ ...base, state: { quadrant: 'swell', energy: 3, pleasantness: 3, emotions: [] } });
    expect(ebb.firstStep).not.toBe(swell.firstStep);
    expect(ebb.focusMinutes).toBe(5);
    expect(swell.focusMinutes).toBe(25);
  });

  it('suggests a strategy only when it helped at least 3 of 5 times', () => {
    expect(unstickFallback(base).strategyId).toBe('m-walk-3');
    expect(unstickFallback({ ...base, helpfulStrategies: [{ id: 't-sudoku', name: 'Mini sudoku', better: 1, n: 3 }] }).strategyId).toBeNull();
  });

  it('answers "Different step" with a different, smaller step', () => {
    const first = unstickFallback(base);
    const second = unstickFallback({ ...base, previousStep: first.firstStep });
    expect(second.firstStep).not.toBe(first.firstStep);
    expect(second.firstStep.length).toBeLessThan(first.firstStep.length);
    const third = unstickFallback({ ...base, previousStep: second.firstStep });
    expect(third.firstStep).not.toBe(second.firstStep);
  });
});

describe('daymode fallback', () => {
  const demo: DayModeInputT = {
    mode: 'gentle',
    requestedMode: 'gentle',
    today: '2026-11-05',
    state: { quadrant: 'ebb', energy: -2, pleasantness: -3 },
    energyBudget: 4,
    tasks: [
      { id: 'lab', title: 'Chemistry lab report', type: 'writing', energyCost: 3, due: '2026-11-06', status: 'in_progress' },
      { id: 'calc', title: 'Calculus problem set 7', type: 'studying', energyCost: 2, due: '2026-11-06', status: 'not_started' },
      { id: 'phys', title: 'Read Physics chapter 4', type: 'studying', energyCost: 2, due: '2026-11-09', status: 'not_started' },
      { id: 'ta', title: 'Email TA about lab data', type: 'admin', energyCost: 1, due: '2026-11-05', status: 'not_started' },
      { id: 'chat', title: 'Reply to group project chat', type: 'social', energyCost: 1, due: null, status: 'not_started' },
      { id: 'laundry', title: 'Laundry', type: 'chores', energyCost: 2, due: null, status: 'not_started' },
    ],
    events: [],
  };

  it('keeps what is due soonest within budget, started work first, and places every task', () => {
    const out = dayModeFallback(demo);
    expect(out.keep).toEqual(['ta', 'lab']);
    expect(out.move.sort()).toEqual(['calc', 'chat', 'laundry', 'phys']);
    expect(checkDayModeOutput(demo, out)).toBeNull();
  });

  it('lets something due today go one point over budget, and nothing else', () => {
    const out = dayModeFallback({
      ...demo,
      energyBudget: 2,
      requestedMode: 'minimum',
      tasks: [
        { id: 'x', title: 'X', type: 'admin', energyCost: 1, due: '2026-11-05', status: 'not_started' },
        { id: 'y', title: 'Y', type: 'admin', energyCost: 2, due: '2026-11-05', status: 'not_started' },
      ],
    });
    expect(out.keep).toEqual(['x', 'y']);
    expect(out.rationale).toMatch(/can't wait/);
  });
});

describe('bridge and narrate fallbacks', () => {
  it('uses the event prep and place, and the top-ranked strategy', () => {
    const out = bridgeFallback({
      mode: 'literal',
      minutesUntil: 9,
      from: { label: 'Chemistry lab' },
      to: { title: 'Calculus', kind: 'class', place: 'Room 4-203', prep: ['Calculator', 'Notes from Tuesday'] },
      candidateStrategies: [
        { id: 'c-box', name: 'Box breathing', durationSec: 120, better: 4, n: 5 },
        { id: 'm-walk-3', name: '3-minute walk', durationSec: 180, better: 0, n: 0 },
      ],
    });
    expect(out.strategyId).toBe('c-box');
    expect(out.prepSteps).toEqual(['Calculator', 'Notes from Tuesday', 'Go to Room 4-203']);
    expect(out.parkingPrompt).toBe('Write the last thing you finished.');
  });

  it('writes a card for every pattern using only numbers from its facts', () => {
    const input: NarrateInputT = {
      mode: 'gentle',
      patterns: [
        { key: 'strategyBeforeTask:m-walk-3:writing', kind: 'strategy_before_task' as const, facts: { strategyName: '3-minute walk', taskType: 'writing', k: 4, n: 5, baselinePct: 25 } },
        { key: 'hardTransition:lab:class', kind: 'hard_transition' as const, facts: { fromLabel: 'lab', toLabel: 'class', k: 3, n: 4 } },
        { key: 'stateTaskStart:ebb:writing', kind: 'state_task_start' as const, facts: { quadrantName: 'Ebb', taskType: 'writing', k: 1, n: 4, baselinePct: 55, direction: 'lower' } },
        { key: 'strategyEffect:c-box', kind: 'strategy_effect' as const, facts: { strategyName: 'Box breathing', k: 4, n: 5 } },
      ],
    };
    const out = narrateFallback(input);
    expect(NarrateOutput.safeParse(out).success).toBe(true);
    out.cards.forEach((card, i) => expect(numbersAreFromFacts(card, input.patterns[i].facts)).toBe(true));
    expect(out.cards[0].whyText).toBe('From 5 times you used 3-minute walk before a writing task; you got going 4 times.');
  });
});
