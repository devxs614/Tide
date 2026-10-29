// The saved demo answers must pass exactly the checks a live answer would,
// or the browser would throw them away on stage.
import { describe, expect, it } from 'vitest';
import { EMOTION_IDS } from '@/data/emotions';
import {
  BridgeOutput,
  DayModeOutput,
  LabelOutput,
  NarrateOutput,
  UnstickOutput,
  checkBridgeOutput,
  checkDayModeOutput,
  checkLabelOutput,
  checkNarrateKeys,
  checkUnstickOutput,
  numbersAreFromFacts,
  type NarrateInputT,
} from '@/lib/ai/schemas';
import { DEMO_CHECKIN_TEXT, findCachedResponse } from './cachedResponses';

describe('cached demo answers', () => {
  it('answers the scripted check-in, and nothing else', () => {
    const input = { mode: 'gentle' as const, localTime: 'Thu 3:40 pm', text: `  ${DEMO_CHECKIN_TEXT.toUpperCase()} `, vocabulary: EMOTION_IDS };
    const out = findCachedResponse('label', input)!;
    expect(LabelOutput.safeParse(out).success).toBe(true);
    expect(checkLabelOutput(input, out)).toBeNull();
    expect(out.candidates.map((c) => c.id)).toEqual(['drained', 'frustrated', 'overwhelmed']);
    expect(findCachedResponse('label', { ...input, text: 'something else' })).toBeUndefined();
  });

  it('gives the lab report step and a smaller one for "Different step"', () => {
    const input = {
      mode: 'gentle' as const,
      task: { title: 'Chemistry lab report', type: 'writing' as const, energyCost: 3 },
      reason: 'dont_know_start' as const,
      helpfulStrategies: [{ id: 'm-walk-3', name: '3-minute walk', better: 4, n: 5 }],
    };
    const first = findCachedResponse('unstick', input)!;
    expect(UnstickOutput.safeParse(first).success && checkUnstickOutput(input, first)).toBeNull();
    expect(first.firstStep).toBe('Open the report and type only the title and date.');
    const second = findCachedResponse('unstick', { ...input, previousStep: first.firstStep })!;
    expect(second.firstStep.length).toBeLessThan(first.firstStep.length);
    expect(findCachedResponse('unstick', { ...input, helpfulStrategies: [] })!.strategyId).toBeNull();
  });

  it('builds a valid Gentle plan from whatever tasks are on the board', () => {
    const input = {
      mode: 'gentle' as const,
      requestedMode: 'gentle' as const,
      today: '2026-11-05',
      state: { quadrant: 'ebb' as const, energy: -1, pleasantness: -3 },
      energyBudget: 4,
      tasks: [
        { id: 'a', title: 'Chemistry lab report', type: 'writing', energyCost: 3, due: '2026-11-06', status: 'in_progress' },
        { id: 'b', title: 'Email TA about lab data', type: 'admin', energyCost: 1, due: '2026-11-05', status: 'not_started' },
        { id: 'c', title: 'Laundry', type: 'chores', energyCost: 2, due: null, status: 'not_started' },
        { id: 'd', title: 'Something Maya added on stage', type: 'other', energyCost: 1, due: null, status: 'not_started' },
      ],
      events: [],
    };
    const out = findCachedResponse('daymode', input)!;
    expect(DayModeOutput.safeParse(out).success).toBe(true);
    expect(checkDayModeOutput(input, out)).toBeNull();
    expect(out.keep).toEqual(['a', 'b']);
  });

  it('picks box breathing for the lab → calculus bridge when it is a candidate', () => {
    const input = {
      mode: 'gentle' as const,
      minutesUntil: 9,
      from: { label: 'Chemistry lab', taskTitle: 'Chemistry lab report' },
      to: { title: 'Calculus', kind: 'class', place: 'Room 4-203', prep: ['Calculator', 'Notes from Tuesday'] },
      candidateStrategies: [
        { id: 'c-box', name: 'Box breathing', durationSec: 120, better: 4, n: 5 },
        { id: 'm-shake-20', name: 'Shake it out', durationSec: 60, better: 0, n: 0 },
      ],
    };
    const out = findCachedResponse('bridge', input)!;
    expect(BridgeOutput.safeParse(out).success && checkBridgeOutput(input, out)).toBeNull();
    expect(out.strategyId).toBe('c-box');
    expect(findCachedResponse('bridge', { ...input, candidateStrategies: [input.candidateStrategies[1]] })!.strategyId).toBe('m-shake-20');
  });

  it('words the three planted patterns with only their own numbers', () => {
    const input: NarrateInputT = {
      mode: 'gentle',
      patterns: [
        { key: 'strategyBeforeTask:m-walk-3:writing', kind: 'strategy_before_task' as const, facts: { strategyName: '3-minute walk', taskType: 'writing', k: 4, n: 5, baselinePct: 25 } },
        { key: 'hardTransition:lab:class', kind: 'hard_transition' as const, facts: { fromLabel: 'lab', toLabel: 'class', k: 3, n: 4 } },
        { key: 'strategyEffect:c-box', kind: 'strategy_effect' as const, facts: { strategyName: 'Box breathing', k: 4, n: 5 } },
      ],
    };
    const out = findCachedResponse('narrate', input)!;
    expect(NarrateOutput.safeParse(out).success && checkNarrateKeys(input, out)).toBeNull();
    out.cards.forEach((c, i) => expect(numbersAreFromFacts(c, input.patterns[i].facts)).toBe(true));
    expect(findCachedResponse('narrate', { ...input, mode: 'literal' })).toBeUndefined();
  });
});
