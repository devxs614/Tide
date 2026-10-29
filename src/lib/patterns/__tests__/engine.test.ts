// The tests Section 12.6 asks for, one per rule of thumb the engine follows,
// plus the double-count guard. Each test reads like the situation it covers.
import { describe, expect, it } from 'vitest';
import { DAY, MINUTE } from '@/lib/time';
import type { FocusOutcome } from '@/lib/types';
import { computePatterns } from '../engine';
import { confidenceFor } from '../confidence';
import { block, checkIn, event, input, NOW, strategyThenBlock, strategyUse, task, transition } from './fixtures';

// Walks before writing with the given outcomes, plus writing blocks with no
// strategy before them (the baseline).
function walkScenario(walkOutcomes: FocusOutcome[], baselineOutcomes: FocusOutcome[], daysAgo = 2) {
  const writing = task('writing');
  const pairs = walkOutcomes.map((o, i) => strategyThenBlock('m-walk-3', writing, daysAgo + i, o));
  const baseline = baselineOutcomes.map((o, i) => block(writing, NOW - (daysAgo + 10 + i) * DAY, o));
  return input({
    tasks: [writing],
    strategyUses: pairs.map((p) => p.use),
    focusBlocks: [...pairs.map((p) => p.block), ...baseline],
  });
}

describe('pattern engine', () => {
  it('shows walk-before-writing at 4 of 5 against a baseline of 1 of 4, with confidence 2', () => {
    const patterns = computePatterns(walkScenario(['got_going', 'got_going', 'got_going', 'got_going', 'a_little'], ['got_going', 'didnt_start', 'a_little', 'didnt_start']));
    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({ key: 'strategyBeforeTask:m-walk-3:writing', k: 4, n: 5, confidence: 2 });
    expect(patterns[0].facts).toEqual({ strategyName: '3-minute walk', taskType: 'writing', k: 4, n: 5, baselinePct: 25 });
    expect(patterns[0].evidence).toHaveLength(5);
  });

  it('counts one focus block once, even after two walks before it', () => {
    const scenario = walkScenario(['got_going', 'got_going', 'got_going', 'got_going', 'a_little'], ['got_going', 'didnt_start', 'a_little', 'didnt_start']);
    const lastBlock = scenario.focusBlocks[0];
    const secondWalk = strategyUse('m-walk-3', lastBlock.ts - 2 * MINUTE);
    const patterns = computePatterns({ ...scenario, strategyUses: [...scenario.strategyUses, secondWalk] });
    expect(patterns[0]).toMatchObject({ k: 4, n: 5 });
    expect(patterns[0].evidenceIds).toContain(secondWalk.id);
  });

  it('keeps a pattern hidden until it has been seen at least three times', () => {
    expect(computePatterns(walkScenario(['got_going', 'got_going'], ['didnt_start', 'didnt_start', 'didnt_start']))).toEqual([]);
  });

  it('stays quiet when the difference from usual is under 25 points (60% vs 50%)', () => {
    const patterns = computePatterns(walkScenario(['got_going', 'got_going', 'got_going', 'a_little', 'a_little'], ['got_going', 'got_going', 'a_little', 'a_little']));
    expect(patterns).toEqual([]);
  });

  it('shows lab → class felt hard 3 of 4 times', () => {
    const lab = event('lab', NOW - 3 * DAY);
    const classes = [1, 2, 3, 4].map((d) => event('class', NOW - d * DAY));
    const transitions = classes.map((c, i) => transition(lab, c, i === 0 ? 'okay' : 'hard'));
    const [p] = computePatterns(input({ events: [lab, ...classes], transitions }));
    expect(p).toMatchObject({ key: 'hardTransition:lab:class', k: 3, n: 4, confidence: 1 });
    expect(p.facts).toEqual({ fromLabel: 'lab', toLabel: 'class', k: 3, n: 4 });
  });

  it('compares the hard rate with and without the strategy when both sides have two switches', () => {
    const lab = event('lab', NOW - 3 * DAY);
    const classes = [1, 2, 3, 4].map((d) => event('class', NOW - d * DAY));
    const box = [strategyUse('c-box', NOW - 1 * DAY, 'better'), strategyUse('c-box', NOW - 2 * DAY, 'better')];
    const transitions = [
      transition(lab, classes[0], 'okay', box[0].id),
      transition(lab, classes[1], 'okay', box[1].id),
      transition(lab, classes[2], 'hard'),
      transition(lab, classes[3], 'hard'),
    ];
    const [p] = computePatterns(input({ events: [lab, ...classes], transitions, strategyUses: box }));
    expect(p.facts).toMatchObject({ withStrategyName: 'Box breathing', withStrategyHardK: 0, withStrategyN: 2, withoutStrategyHardK: 2, withoutStrategyN: 2 });
  });

  it('never shows a pattern Maya marked "not true for me"', () => {
    const scenario = walkScenario(['got_going', 'got_going', 'got_going', 'got_going', 'a_little'], ['didnt_start', 'didnt_start', 'didnt_start', 'got_going']);
    scenario.dismissedKeys = new Set(['strategyBeforeTask:m-walk-3:writing']);
    expect(computePatterns(scenario)).toEqual([]);
  });

  it('ignores records outside the window', () => {
    const old = walkScenario(['got_going', 'got_going', 'got_going', 'got_going', 'a_little'], ['didnt_start', 'didnt_start', 'didnt_start', 'got_going'], 30);
    expect(computePatterns(old)).toEqual([]);
    const recent = walkScenario(['got_going', 'got_going', 'got_going', 'got_going', 'a_little'], ['didnt_start', 'didnt_start', 'didnt_start', 'got_going'], 2);
    expect(computePatterns({ ...recent, windowDays: 7 })).toEqual([]);
  });

  it('ignores check-ins where the safety layer fired', () => {
    const writing = task('writing');
    const blocks = [1, 2, 3].map((d) => block(writing, NOW - d * DAY, 'didnt_start'));
    const others = [4, 5, 6].map((d) => block(writing, NOW - d * DAY, 'got_going'));
    const surge = [4, 5, 6].map((d) => checkIn('surge', NOW - d * DAY - 30 * MINUTE));
    const ebbSafe = [1, 2, 3].map((d) => checkIn('ebb', NOW - d * DAY - 30 * MINUTE, true));
    const ebb = [1, 2, 3].map((d) => checkIn('ebb', NOW - d * DAY - 30 * MINUTE));
    const base = { tasks: [writing], focusBlocks: [...blocks, ...others] };
    // With real Ebb check-ins, Ebb-before-writing (0 of 3) stands out.
    expect(computePatterns(input({ ...base, checkins: [...surge, ...ebb] })).map((p) => p.key)).toContain('stateTaskStart:ebb:writing');
    // The same check-ins flagged by the safety layer teach nothing.
    expect(computePatterns(input({ ...base, checkins: [...surge, ...ebbSafe] })).map((p) => p.key)).not.toContain('stateTaskStart:ebb:writing');
  });

  it('turns n into confidence at 3, 5, 8 and 12', () => {
    expect([3, 4, 5, 7, 8, 11, 12, 30].map(confidenceFor)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it('returns at most six, most certain first, then the most observations', () => {
    const ids = ['c-box', 'c-54321', 'c-long-exhale', 'c-quiet', 'c-music', 't-count-7', 't-spot-blue'];
    const uses = ids.flatMap((sid, i) => Array.from({ length: 3 + i }, (_, j) => strategyUse(sid, NOW - (j + 1) * DAY, 'better')));
    const patterns = computePatterns(input({ strategyUses: uses }));
    expect(patterns).toHaveLength(6);
    expect(patterns.map((p) => p.n)).toEqual([9, 8, 7, 6, 5, 4]);
    expect(patterns[0].confidence).toBe(3);
  });
});
